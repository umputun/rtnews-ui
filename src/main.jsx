import "./style.scss";
import "intersection-observer";
import "./ganalitics.js";

import React from "react";

import { render } from "react-dom";
import {
	store,
	setState,
	setTheme,
	addNotification,
	removeNotificationsWithContext,
} from "./store.jsx";
import {
	getActiveArticle,
	pollActiveArticle,
	getAutoScroll,
	loginViaCookies,
	getTheme,
	getArticleById,
} from "./api.js";
import { waitDOMReady, sleep } from "./utils.js";

import Head from "./head.jsx";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { Provider, connect } from "react-redux";
import AddArticle from "./add.jsx";
import {
	Listing,
	ArchiveListing,
	DeletedListing,
	Sorter,
} from "./articleListings.jsx";
import Article from "./article.jsx";
import Feeds from "./feeds.jsx";
import LoginForm from "./login.jsx";
import NotFound from "./notFound.jsx";
import Notifications from "./notifications.jsx";
import LinkToCurrent from "./linkToCurrent.jsx";

import { listingRef } from "./symbols.js";

class App extends React.Component {
	render() {
		return (
			<Router>
				<div className="page">
					<Head {...this.props} />
					<Switch>
						<Route
							path="/"
							exact={true}
							render={() => (
								<Listing
									{...this.props}
									ref={ref => (window[listingRef] = ref)}
								/>
							)}
						/>
						<Route
							path="/deleted/"
							exact={true}
							render={() => <DeletedListing {...this.props} />}
						/>
						<Route
							path="/archive/"
							exact={true}
							render={() => <ArchiveListing {...this.props} />}
						/>
						<Route
							path="/add/"
							exact={true}
							render={() => {
								document.title = "Добавить новость | Новости Радио-Т";
								return <AddArticle {...this.props} />;
							}}
						/>
						<Route
							path="/feeds/"
							exact={true}
							render={() => <Feeds {...this.props} />}
						/>
						<Route path="/sort/" render={() => <Sorter {...this.props} />} />
						<Route
							path="/news/:slug"
							render={props => <Article slug={props.match.params.slug} />}
						/>
						<Route path="/login/" exact={true} render={() => <LoginForm />} />
						<Route component={NotFound} />
					</Switch>
					<div className="footer page__footer">
						<hr />
						<a href="http://radio-t.com/">Radio-T</a>,{" "}
						{new Date().getFullYear()}
					</div>
					<Notifications
						className="page__notifications"
						notifications={this.props.notifications}
					/>
				</div>
			</Router>
		);
	}
}

async function main() {
	const theme = getTheme();
	document.documentElement.dataset.theme = theme;
	setTheme(theme, true);

	const CApp = connect(state => {
		return state;
	})(App);

	await loginViaCookies().then(isAdmin => {
		setState({ isAdmin });
	});

	setState({ autoScroll: getAutoScroll() });

	render(
		<Provider store={store}>
			<CApp />
		</Provider>,
		document.querySelector(".app")
	);

	getActiveArticle().then(async activeId => {
		setState({ activeId });
		await waitDOMReady();
		while (true) {
			try {
				const activeId = await pollActiveArticle();
				if (activeId === store.getState().activeId) {
					removeNotificationsWithContext("active-article");
					addNotification({
						data: <b>Тема активирована</b>,
						time: 3000,
					});
					continue;
				}
				setState({ activeId });
				setImmediate(async () => {
					if (store.getState().autoScroll) {
						setTimeout(() => {
							const el = document.querySelector(".post-active");
							if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
						}, 500);
					}
					sleep(700).then(() => {
						document.title = "* Тема обновлена | Новости Радио-Т";
					});
					const article = await getArticleById(activeId);

					if (article && article.hasOwnProperty("title")) {
						removeNotificationsWithContext("active-article");
						addNotification(remove => ({
							data: (
								<span>
									Тема обновлена:
									<br />
									<LinkToCurrent
										title={`“${article.title}”`}
										onClick={() => remove()}
									/>
								</span>
							),
							time: null,
							context: "active-article",
						}));
					}
				});
			} catch (e) {
				await sleep(60000);
			}
		}
	});
}

main().catch(e => console.error(e));
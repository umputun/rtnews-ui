declare const BUILDTIME: string;

import { Component } from "react";

import { postsPrefix } from "./settings";

import Head from "./head";
import {
	BrowserRouter as Router,
	Route,
	Switch,
	Redirect,
	RouteComponentProps,
} from "react-router-dom";
import { ScrollContext } from "react-router-scroll-4";
import AddArticle from "./add";
import {
	ListingWithAutoUpdate,
	ArchiveListingWithAutoUpdate,
	DeletedListingWithAutoUpdate,
	SorterWithAutoUpdate,
} from "./articleListings";
import { Article, EditableArticle } from "./article";
import Feeds from "./feeds";
import LoginForm from "./login";
import NotFound from "./notFound";
import { Notifications } from "./notifications";

import { listingRef } from "./references";
import { ThemeType } from "./themeInterface";

type AppProps = {
	issueNumber: {
		number: number;
		link: string | null;
	} | null;
	isAdmin: boolean;
	activeId: null | string;
	theme: ThemeType;
};

export default class App extends Component<AppProps> {
	protected router: Router | null;
	constructor(props: AppProps) {
		super(props);
		this.router = null;
	}
	render() {
		return (
			<Router ref={router => (this.router = router)}>
				<div className="page">
					<Route
						render={({ history }) => <Head {...this.props} history={history} />}
					/>
					<div className="content page__content">
						<Switch>
							<Route
								path="/"
								exact={true}
								render={() => (
									<ScrollContext scrollKey="main">
										<ListingWithAutoUpdate
											isAdmin={this.props.isAdmin}
											activeId={this.props.activeId}
											ref={ref => ((window as any)[listingRef] = ref)}
										/>
									</ScrollContext>
								)}
							/>
							<Route
								path="/admin/"
								exact={true}
								render={() => <Redirect to="/login/" />}
							/>
							<Route
								path="/deleted/"
								exact={true}
								render={() =>
									this.props.isAdmin ? (
										<ScrollContext>
											<DeletedListingWithAutoUpdate />
										</ScrollContext>
									) : (
										<Redirect to="/login/" />
									)
								}
							/>
							<Route
								path="/archive/"
								exact={true}
								render={() => (
									<ScrollContext>
										<ArchiveListingWithAutoUpdate
											isAdmin={this.props.isAdmin}
										/>
									</ScrollContext>
								)}
							/>
							<Route
								path="/add/"
								exact={true}
								render={() => {
									if (!this.props.isAdmin) return <Redirect to="/login/" />;
									document.title = "Добавить новость | Новости Радио-Т";
									return <AddArticle />;
								}}
							/>
							<Route
								path="/feeds/"
								exact={true}
								render={() =>
									this.props.isAdmin ? <Feeds /> : <Redirect to="/login/" />
								}
							/>
							<Route
								path="/sort/"
								render={() =>
									this.props.isAdmin ? (
										<ScrollContext>
											<SorterWithAutoUpdate activeId={this.props.activeId} />
										</ScrollContext>
									) : (
										<Redirect to="/login/" />
									)
								}
							/>
							<Route
								path={`${postsPrefix}/:slug`}
								render={(props: RouteComponentProps) =>
									this.props.isAdmin ? (
										<ScrollContext
											scrollKey="post"
											shouldUpdateScroll={(_: any, cur: any) =>
												!!cur.location.key
											}
										>
											<EditableArticle
												slug={(props.match!.params as any).slug}
											/>
										</ScrollContext>
									) : (
										<ScrollContext
											scrollKey="post"
											shouldUpdateScroll={(_: any, cur: any) =>
												!!cur.location.key
											}
										>
											<Article slug={(props.match!.params as any).slug} />
										</ScrollContext>
									)
								}
							/>
							<Route path="/login/" exact={true} render={() => <LoginForm />} />
							<Route component={NotFound} />
						</Switch>
					</div>
					<div className="footer page__footer">
						<hr />
						<a href="http://radio-t.com/">Radio-T</a>,{" "}
						{new Date().getFullYear()}
						<br />
						<span className="footer__buildtime">built on {BUILDTIME}</span>
					</div>
					<Notifications className="page__notifications" />
				</div>
			</Router>
		);
	}
}

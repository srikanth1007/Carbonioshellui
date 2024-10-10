/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
/* eslint-disable import/no-import-module-exports */

import './index.css';
import React, { lazy, Suspense, useEffect, useState } from 'react';

import ReactDOM from 'react-dom';

import { LoadingView } from './boot/splash';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import { BACKGROUND_COLOR } from './sruvi/EditedColors';

window.addEventListener('contextmenu', (ev) => {
	if (
		!(
			['IMG', 'A'].find(
				(name) => ev?.target instanceof HTMLElement && ev.target.tagName === name
			) ||
			ev.view?.getSelection?.()?.type === 'Range' ||
			ev
				.composedPath()
				.find(
					(element) =>
						element instanceof HTMLElement &&
						element.classList.contains('carbonio-bypass-context-menu')
				)
		)
	) {
		ev.preventDefault();
	}
});

const Bootstrapper = lazy(() => import('./boot/bootstrapper'));

if (module.hot) {
	module.hot.accept();
}

const App = () => {
	const [isLoaded, setIsLoaded] = useState(false);
	const [showLoadingView, setShowLoadingView] = useState(true);

	useEffect(() => {
		const timer = setTimeout(() => {
			setIsLoaded(true);
			setShowLoadingView(false);
		}, 3000);
		return () => clearTimeout(timer);
	}, []);

	return (
		<div>
			{showLoadingView && <LoadingView />}
			{isLoaded && (
				<Suspense
					fallback={
						<div
							style={{
								height: '100vh',
								width: '100vw',
								backgroundColor: BACKGROUND_COLOR
							}}
						>
							please wait..
						</div>
					}
				>
					<Bootstrapper key="boot" />
				</Suspense>
			)}
		</div>
	);
};

ReactDOM.render(<App />, document.getElementById('app'));

/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { useContext, useEffect } from 'react';

import { Container, Row } from '@zextras/carbonio-design-system';
import { PreviewManager } from '@zextras/carbonio-ui-preview';
import styled from 'styled-components';

import AppViewContainer from './app-view-container';
import { BoardContainer } from './boards/board-container';
import ShellContextProvider from './shell-context-provider';
import ShellHeader from './shell-header';
import ShellPrimaryBar from './shell-primary-bar';
import ShellSecondaryBar from './shell-secondary-bar';
import { ThemeCallbacksContext } from '../boot/theme-provider';
import { IS_FOCUS_MODE } from '../constants';
import { useDarkReaderResultValue } from '../dark-mode/use-dark-reader-result-value';
import { ShellUtilityBar } from '../utility-bar/bar';
import { ShellUtilityPanel } from '../utility-bar/panel';
import { Card, Drawer, Grid2 } from '@mui/material';
import { BACKGROUND_COLOR, FOREGROUND_COLOR } from '../sruvi/EditedColors';
import { useUtilityBarStore } from '../utility-bar/store';
import { CreationButton } from './creation-button';
import Desktop from '../sruvi/Desktop';
import Mobile from '../sruvi/Mobile';
import VeryLarge from '../sruvi/VeryLarge';
import type { AppRoute } from '../types/apps';
import { useCurrentRoute } from '../lib';

const Background = styled.div`
	background: ${({ theme }): string => theme.palette.gray6.regular};
	display: flex;
	flex-direction: column;
	height: 100%;
	min-height: 100%;
	max-height: 100%;
	width: 100%;
	min-width: 60rem;
	max-width: 100%;
`;

const ShellComponent = () => {
	const isOpen = useUtilityBarStore((s) => s.secondaryBarState);

	const [barisopen, setbarisopen] = React.useState(false);

	useEffect(() => {
		if (isOpen) {
			setbarisopen(true);
		} else {
			setbarisopen(false);
		}
	}, [isOpen]);

	const [open, setOpen] = React.useState(false);

	const toggleDrawer = (newOpen: boolean) => () => {
		setOpen(newOpen);
	};

	const routeid = useCurrentRoute();
	const [routesearch, setroutesearch] = React.useState(false);
	const [routesettings, setroutesettings] = React.useState(false);

	useEffect(() => {
		if (routeid?.id === 'search') {
			setroutesearch(true);
			setroutesettings(false);
		} else if (routeid?.id === 'settings') {
			setroutesettings(true);
			setroutesearch(false);
		} else {
			setroutesettings(false);
			setroutesearch(false);
		}
	}, [routeid]);

	return (
		<div
			style={{
				height: '100vh',
				width: '100vw',
				display: 'flex',
				backgroundColor: BACKGROUND_COLOR,
				overflow: 'hidden'
			}}
		>
			<VeryLarge>
				<Grid2 container sx={{ height: '100%', width: '100%' }}>
					<Grid2 size={12}>
						{!IS_FOCUS_MODE && (
							<ShellHeader>
								<ShellUtilityBar />
							</ShellHeader>
						)}
					</Grid2>

					<Grid2
						size={12}
						sx={{ height: 'calc(100% - 96px)', width: '100%', backgroundColor: BACKGROUND_COLOR }}
					>
						<div style={{ height: '100%', width: '100%' }}>
							<Grid2 container spacing={2} sx={{ height: '100%', width: '100%' }}>
								<Grid2
									size={barisopen ? 2 : 1}
									sx={{ height: '100%', backgroundColor: BACKGROUND_COLOR }}
								>
									<div style={{ height: '100%', width: '100%' }}>
										<Grid2 container spacing={2} sx={{ width: '100%' }}>
											<Grid2 size={12} sx={{ height: 'auto' }}>
												{routesearch || routesettings ? null : <CreationButton />}
											</Grid2>
											<Grid2 size={12}>
												{!IS_FOCUS_MODE && (
													<Container
														orientation="horizontal"
														background={'transparent'}
														width="fill"
														height="fill"
														mainAlignment="flex-start"
														crossAlignment="flex-start"
													>
														<ShellSecondaryBar />
													</Container>
												)}
											</Grid2>
										</Grid2>
									</div>
								</Grid2>
								<Grid2
									size={barisopen ? 9.5 : 10.5}
									sx={{
										height: '100%',
										backgroundColor: BACKGROUND_COLOR,
										borderTopLeftRadius: '16px',
										borderTopRightRadius: '16px'
									}}
								>
									<Card
										raised
										sx={{
											height: '100%',
											width: '100%',
											borderTopLeftRadius: '16px',
											borderTopRightRadius: '16px'
										}}
									>
										<AppViewContainer />
										<ShellUtilityPanel />
									</Card>
								</Grid2>
								<Grid2
									size={barisopen ? 0.5 : 0.5}
									sx={{ height: '100%', backgroundColor: BACKGROUND_COLOR }}
								>
									{!IS_FOCUS_MODE && (
										<Container
											orientation="horizontal"
											background={'transparent'}
											width="fill"
											height="fill"
											mainAlignment="flex-start"
											crossAlignment="flex-start"
										>
											<ShellPrimaryBar />
										</Container>
									)}
								</Grid2>
							</Grid2>
						</div>
					</Grid2>
				</Grid2>
				<BoardContainer />
			</VeryLarge>
			<Desktop>
				<Grid2 container sx={{ height: '100%', width: '100%' }}>
					<Grid2 size={12}>
						{!IS_FOCUS_MODE && (
							<ShellHeader>
								<ShellUtilityBar />
							</ShellHeader>
						)}
					</Grid2>

					<Grid2
						size={12}
						sx={{ height: 'calc(100% - 96px)', width: '100%', backgroundColor: BACKGROUND_COLOR }}
					>
						<div style={{ height: '100%', width: '100%' }}>
							<Grid2 container spacing={2} sx={{ height: '100%', width: '100%' }}>
								<Grid2
									size={barisopen ? 3 : routesearch ? 1.5 : 1.5}
									sx={{ height: '100%', backgroundColor: BACKGROUND_COLOR }}
								>
									<div style={{ height: '100%', width: '100%' }}>
										<Grid2 container spacing={2} sx={{ width: '100%' }}>
											<Grid2 size={12} sx={{ height: 'auto' }}>
												{routesearch || routesettings ? null : <CreationButton />}
											</Grid2>
											<Grid2 size={12}>
												{!IS_FOCUS_MODE && (
													<Container
														orientation="horizontal"
														background={'transparent'}
														width="fill"
														height="fill"
														mainAlignment="flex-start"
														crossAlignment="flex-start"
													>
														<ShellSecondaryBar />
													</Container>
												)}
											</Grid2>
										</Grid2>
									</div>
								</Grid2>
								<Grid2
									size={barisopen ? 8 : 9.5}
									sx={{
										height: '100%'
									}}
								>
									<Card
										raised
										sx={{
											height: '100%',
											width: '100%',
											borderTopLeftRadius: '16px',
											borderTopRightRadius: '16px',
											backgroundColor: BACKGROUND_COLOR
										}}
									>
										<AppViewContainer />
										<ShellUtilityPanel />
									</Card>
								</Grid2>
								<Grid2
									size={barisopen ? 1 : 1}
									sx={{ height: '100%', backgroundColor: BACKGROUND_COLOR }}
								>
									{!IS_FOCUS_MODE && (
										<Container
											orientation="horizontal"
											background={'transparent'}
											width="fill"
											height="fill"
											mainAlignment="flex-start"
											crossAlignment="flex-start"
										>
											<ShellPrimaryBar />
										</Container>
									)}
								</Grid2>
							</Grid2>
						</div>
					</Grid2>
				</Grid2>
				<BoardContainer />
			</Desktop>
			<Mobile>
				<div style={{ height: '100%', width: '100%' }}>
					<div style={{ height: '70px', width: '100%' }}>
						{!IS_FOCUS_MODE && (
							<ShellHeader>
								<ShellUtilityBar />
							</ShellHeader>
						)}
					</div>

					<div style={{ height: 'calc(100% - 70px)', width: '100%' }}>
						<div style={{ height: '100%', width: '100%', marginTop: '16px' }}>
							<AppViewContainer />
							<ShellUtilityPanel />
						</div>
					</div>
					<div
						style={{ display: 'flex', position: 'fixed', bottom: '0', left: '0', width: '100%' }}
					>
						{!IS_FOCUS_MODE && (
							// <Container
							// 	orientation="horizontal"
							// 	background={'transparent'}
							// 	width="fill"
							// 	height="fill"
							// 	mainAlignment="flex-start"
							// 	crossAlignment="flex-start"
							// >

							<div style={{ height: '60px', width: '100%' }}>
								<ShellPrimaryBar />
							</div>

							// </Container>
						)}
					</div>
					<div
						style={{
							display: 'flex',
							position: 'fixed',
							bottom: '86px',
							right: '16px'
						}}
					>
						{routesearch || routesettings ? null : <CreationButton />}
					</div>
				</div>
			</Mobile>
			<div>
				<BoardContainer />
			</div>
		</div>
	);
};

// <Background>
// 	<DarkReaderListener />
// 	{!IS_FOCUS_MODE && (
// 		<ShellHeader>
// 			<ShellUtilityBar />
// 		</ShellHeader>
// 	)}
// 	<Row crossAlignment="unset" style={{ position: 'relative', flexGrow: '1' }}>
// 		{!IS_FOCUS_MODE && (
// 			<Container
// 				orientation="horizontal"
// 				background={'gray5'}
// 				width="fit"
// 				height="fill"
// 				mainAlignment="flex-start"
// 				crossAlignment="flex-start"
// 			>
// 				<ShellPrimaryBar />
// 				<ShellSecondaryBar />
// 			</Container>
// 		)}
// 		<AppViewContainer />
// 		<ShellUtilityPanel />
// 	</Row>
// 	<BoardContainer />
// </Background>

const ShellView = (): React.JSX.Element => (
	<ShellContextProvider>
		<PreviewManager>
			<ShellComponent />
		</PreviewManager>
	</ShellContextProvider>
);

export default ShellView;

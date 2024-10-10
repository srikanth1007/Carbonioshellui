/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { useCallback, useEffect, useState } from 'react';

import {
	Catcher,
	Container,
	Padding,
	Responsive,
	useScreenMode
} from '@zextras/carbonio-design-system';
import styled from 'styled-components';

import { CreationButton } from './creation-button';
import { Logo } from './logo';
import { BOARD_CONTAINER_ZINDEX, HEADER_BAR_HEIGHT } from '../constants';
import { useDarkMode } from '../dark-mode/use-dark-mode';
import { SearchBar } from '../search/search-bar';
import { useAppStore } from '../store/app';

/////sruvi
import { Card, Drawer, Grid2, IconButton, Typography } from '@mui/material';
import { BACKGROUND_COLOR, FOREGROUND_COLOR } from '../sruvi/EditedColors';
import Desktop from '../sruvi/Desktop';
import Mobile from '../sruvi/Mobile';
import MenuIcon from '@mui/icons-material/Menu';
import indryvelogo from '../../assets/indryve.png';
import { useUserAccount } from '../lib';
import { useUtilityBarStore } from '../utility-bar/store';
import { Collapser } from './collapser';
import ShellSecondaryBar from './shell-secondary-bar';
import VeryLarge from '../sruvi/VeryLarge';
import { AccountCircleRounded, PersonOffOutlined } from '@mui/icons-material';

//////////sruvi

const StyledLogo = styled(Logo)`
	height: 2rem;
`;

const ShellHeaderContainer = styled(Container)`
	z-index: ${BOARD_CONTAINER_ZINDEX + 1};
`;

interface ShellHeaderProps {
	children: React.ReactNode | React.ReactNode[];
}

const ShellHeader = ({ children }: ShellHeaderProps): React.JSX.Element => {
	const { darkReaderStatus } = useDarkMode();

	const screenMode = useScreenMode();
	const searchEnabled = useAppStore((s) => s.views.search.length > 0);
	const account = useUserAccount();

	//sruvi
	const isOpen = useUtilityBarStore((s) => s.secondaryBarState);

	const onclickedbar = () => {
		useUtilityBarStore.getState().setSecondaryBarState(!isOpen);
	};

	const [open, setOpen] = React.useState(false);

	const toggleDrawer = (newOpen: boolean) => () => {
		setOpen(newOpen);
	};

	///sruvi
	return (
		<div style={{ width: '100%', height: '100%' }}>
			<VeryLarge>
				<Catcher>
					<Grid2
						container
						sx={{ height: '100%', width: '100%', backgroundColor: BACKGROUND_COLOR }}
					>
						<Grid2 size={3} sx={{ height: '96px' }}>
							<div
								style={{
									display: 'flex',
									flexDirection: 'row',
									alignItems: 'center',
									justifyContent: 'flex-start',
									height: '100%',
									marginLeft: '16px'
								}}
							>
								<IconButton onClick={onclickedbar}>
									<MenuIcon style={{}} />
								</IconButton>

								<img
									src={indryvelogo}
									style={{
										height: '40px',
										width: 'auto',

										marginLeft: '16px'
									}}
								/>
							</div>
						</Grid2>
						<Grid2 size={6}>{searchEnabled && <SearchBar />}</Grid2>
						<Grid2 size={3}>
							<div
								style={{
									display: 'flex',
									flexDirection: 'row',
									justifyContent: 'flex-end',
									marginRight: '16px',
									alignItems: 'center',
									height: '100%'
								}}
							>
								<Typography variant="body2" style={{ marginRight: '16px' }}>
									Welcome! {account?.displayName || 'Guest'}
								</Typography>
								<Card raised sx={{ backgroundColor: FOREGROUND_COLOR, borderRadius: '50%' }}>
									{children}
								</Card>
							</div>
						</Grid2>
					</Grid2>
				</Catcher>
			</VeryLarge>
			<Desktop>
				<Catcher>
					<Grid2
						container
						sx={{ height: '100%', width: '100%', backgroundColor: BACKGROUND_COLOR }}
					>
						<Grid2 size={3} sx={{ height: '96px' }}>
							<div
								style={{
									display: 'flex',
									flexDirection: 'row',
									alignItems: 'center',
									justifyContent: 'flex-start',
									height: '100%',
									marginLeft: '16px'
								}}
							>
								<IconButton onClick={onclickedbar}>
									<MenuIcon style={{}} />
								</IconButton>

								<img
									src={indryvelogo}
									style={{
										height: '40px',
										width: 'auto',

										marginLeft: '16px'
									}}
								/>
							</div>
						</Grid2>
						<Grid2 size={6}>{searchEnabled && <SearchBar />}</Grid2>
						<Grid2 size={3}>
							<div
								style={{
									display: 'flex',
									flexDirection: 'row',
									justifyContent: 'flex-end',
									marginRight: '16px',
									alignItems: 'center',
									height: '100%'
								}}
							>
								<Typography variant="body2" style={{ marginRight: '16px' }}>
									Welcome! {account?.displayName || 'Guest'}
								</Typography>
								<Card raised sx={{ backgroundColor: FOREGROUND_COLOR, borderRadius: '50%' }}>
									{children}
								</Card>
							</div>
						</Grid2>
					</Grid2>
				</Catcher>
			</Desktop>
			<Mobile>
				<Catcher>
					<div
						style={{
							width: '100%',
							height: '70px',
							display: 'flex',
							flexDirection: 'column',
							alignItems: 'center',
							justifyContent: 'center'
						}}
					>
						<Card
							raised
							sx={{
								maxWidth: '100%',
								minWidth: '90%',
								height: '50px'
							}}
						>
							<Grid2
								container
								sx={{ height: '100%', width: '100%', backgroundColor: BACKGROUND_COLOR }}
							>
								<Grid2 size={6} sx={{ height: '100%' }}>
									<div
										style={{
											display: 'flex',
											flexDirection: 'row',
											alignItems: 'center',
											justifyContent: 'flex-start',
											height: '100%',
											marginLeft: '8px'
										}}
									>
										<IconButton onClick={() => setOpen(true)}>
											<MenuIcon style={{}} />
										</IconButton>

										<img
											src={indryvelogo}
											style={{
												height: '30px',
												width: 'auto',
												marginLeft: '8px'
											}}
										/>
									</div>
								</Grid2>

								<Grid2 size={6}>
									<div
										style={{
											display: 'flex',
											flexDirection: 'row',
											justifyContent: 'flex-end',
											marginRight: '16px',
											alignItems: 'center',
											height: '100%'
										}}
									>
										{/* <Typography variant="body2" style={{ marginRight: '16px' }}>
									Welcome! {account?.displayName || 'Guest'}
								</Typography> */}
										<Card raised sx={{ backgroundColor: FOREGROUND_COLOR, borderRadius: '50%' }}>
											{children}
										</Card>
									</div>
								</Grid2>
							</Grid2>
						</Card>
					</div>
					<Drawer
						sx={{ width: '60vw', height: '100%', borderTopRightRadius: '10px' }}
						anchor="left"
						open={open}
						onClose={toggleDrawer(false)}
					>
						<div
							style={{
								width: '60vw',
								height: '100%',
								borderTopRightRadius: '10px',
								justifyContent: 'space-between'
							}}
						>
							<div
								style={{
									height: '20%',
									backgroundColor: FOREGROUND_COLOR,
									display: 'flex',
									flexDirection: 'column',
									justifyContent: 'flex-end'
								}}
							>
								<AccountCircleRounded style={{ marginLeft: '16px', fontSize: '48px' }} />
								<Typography variant="h6" style={{ marginLeft: '16px' }}>
									Welcome {account?.displayName || 'Guest'}
								</Typography>
							</div>
							<div style={{ height: '75%' }}>
								<div style={{ width: '100%', height: '100%', overflowY: 'auto' }}>
									<ShellSecondaryBar />
								</div>
							</div>

							<div
								style={{
									height: '5%',
									backgroundColor: FOREGROUND_COLOR,
									display: 'flex',
									flexDirection: 'column',
									justifyContent: 'flex-end'
								}}
							>
								<Typography style={{ marginLeft: '16px' }} variant="body2">
									Copyrights @ 2024 Indryve Inc.
								</Typography>
							</div>
						</div>
					</Drawer>
				</Catcher>
			</Mobile>
		</div>
	);
};
export default ShellHeader;
{
	/* <ShellHeaderContainer
							data-testid="MainHeaderContainer"
							orientation="horizontal"
							background={'gray3'}
							width="fill"
							height={HEADER_BAR_HEIGHT}
							minHeight={HEADER_BAR_HEIGHT}
							maxHeight={HEADER_BAR_HEIGHT}
							mainAlignment="space-between"
							padding={{
								horizontal: screenMode === 'desktop' ? 'large' : 'extrasmall',
								vertical: 'small'
							}}
						>
							<Container
								orientation="horizontal"
								mainAlignment="flex-start"
								minWidth="fit-content"
								data-testid="HeaderMainLogoContainer"
							>
								<Container width="15.625rem" height="2rem" crossAlignment="flex-start">
									{darkReaderStatus && <StyledLogo />}
								</Container>
								<Padding horizontal="large">
									<CreationButton />
								</Padding>
								<Responsive mode="desktop">{searchEnabled && <SearchBar />}</Responsive>
							</Container>
							<Container orientation="horizontal" width="auto" mainAlignment="flex-end">
								<Responsive mode="desktop">{children}</Responsive>
							</Container>
						</ShellHeaderContainer> */
}

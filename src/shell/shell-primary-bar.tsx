/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { useEffect, useMemo, useRef } from 'react';

import { Container, IconButton, Row, Tooltip } from '@zextras/carbonio-design-system';
import { map, isEmpty, trim, filter, sortBy, noop } from 'lodash';
import { useHistory, useLocation } from 'react-router-dom';
import styled from 'styled-components';

import BadgeWrap from './badge-wrap';
import AppContextProvider from '../boot/app/app-context-provider';
import { BOARD_CONTAINER_ZINDEX, PRIMARY_BAR_WIDTH, SEARCH_APP_ID } from '../constants';
import { useCurrentRoute } from '../history/hooks';
import { useAppStore } from '../store/app';
import { minimizeBoards, reopenBoards, useBoardStore } from '../store/boards';
import type { PrimaryAccessoryView, PrimaryBarView } from '../types/apps';
import { checkRoute } from '../utility-bar/utils';
import {
	ACCESSORY_ICON_COLOR,
	FOREGROUND_COLOR,
	FOREGROUND_COLOR_FOCUSED,
	PRIMARY_ICON_COLOR_ACTIVE,
	PRIMARY_ICON_COLOR_INACTIVE,
	RAISED_SEARCH_BAR
} from '../sruvi/EditedColors';
import Desktop from '../sruvi/Desktop';
import Mobile from '../sruvi/Mobile';
import { Card } from '@mui/material';
import VeryLarge from '../sruvi/VeryLarge';
import { useMediaQuery } from 'react-responsive';

const PrimaryBarContainer = styled(Container)`
	border-right: 0.0625rem solid ${({ theme }): string => theme.palette.gray3.regular};
	z-index: ${BOARD_CONTAINER_ZINDEX + 1};
`;

const ToggleBoardIcon = (): React.JSX.Element | null => {
	const { minimized, boards } = useBoardStore();

	return isEmpty(boards) ? null : (
		<Container width={'4rem'} height={'4rem'}>
			<IconButton
				iconColor={ACCESSORY_ICON_COLOR}
				icon={minimized ? 'BoardOpen' : 'BoardCollapse'}
				onClick={minimized ? reopenBoards : minimizeBoards}
				size="large"
			/>
		</Container>
	);
};

type PrimaryBarItemProps = {
	view: PrimaryBarView;
	active: boolean;
	onClick: () => void;
};

type PrimaryBarAccessoryItemProps = {
	view: PrimaryAccessoryView;
};

const PrimaryBarElement = ({
	view,
	active,
	onClick
}: PrimaryBarItemProps): React.JSX.Element | null => {
	const isDesktop = useMediaQuery({ minWidth: 1025 });

	const isTabletOrMobile = useMediaQuery({ maxWidth: 1024 });

	if (isTabletOrMobile) {
		if (
			['Files', 'Chats', 'Contact Groups and Distribution Lists', 'Tasks', 'Search'].includes(
				view.label
			)
		) {
			return null;
		}
	} else {
		if (['Files', 'Chats', 'Contact Groups and Distribution Lists'].includes(view.label)) {
			return null;
		}
	}

	const [raise, setRaise] = React.useState(false);
	useEffect(() => {
		if (RAISED_SEARCH_BAR) {
			setRaise(true);
		} else {
			setRaise(false);
		}
	}, [RAISED_SEARCH_BAR]);

	return (
		<Tooltip label={view.label} placement="right" key={view.id}>
			<BadgeWrap badge={view.badge}>
				{typeof view.component === 'string' ? (
					<Card raised={raise && active ? true : false}>
						<IconButton
							icon={view.component}
							backgroundColor={active ? FOREGROUND_COLOR : FOREGROUND_COLOR_FOCUSED}
							iconColor={active ? PRIMARY_ICON_COLOR_ACTIVE : PRIMARY_ICON_COLOR_INACTIVE}
							onClick={onClick}
							size="large"
							data-isselected={active}
						/>
					</Card>
				) : (
					<view.component active={active} />
				)}
			</BadgeWrap>
		</Tooltip>
	);
};

const PrimaryBarAccessoryElement = ({ view }: PrimaryBarAccessoryItemProps): React.JSX.Element => (
	<Tooltip label={view.label} placement="right" key={view.id}>
		<AppContextProvider key={view.id} pkg={view.app}>
			{typeof view.component === 'string' ? (
				<IconButton
					icon={view.component}
					backgroundColor="gray6"
					iconColor="text"
					onClick={view.onClick ?? noop}
					size="large"
				/>
			) : (
				<view.component />
			)}
		</AppContextProvider>
	</Tooltip>
);

const OverlayRow = styled(Row)`
	min-height: 0.0625rem;
	overflow-y: auto;
	overflow-y: overlay;
`;

const ShellPrimaryBar = (): React.JSX.Element | null => {
	const activeRoute = useCurrentRoute();
	const primaryBarViews = useAppStore((s) => s.views.primaryBar);
	const { push } = useHistory();

	const { pathname, search } = useLocation();
	const routesRef = useRef<Record<string, string>>({});

	useEffect(() => {
		routesRef.current = primaryBarViews.reduce((accumulator, view) => {
			if (!accumulator[view.id]) {
				accumulator[view.id] = view.route;
			}
			return accumulator;
		}, routesRef.current);
	}, [primaryBarViews]);

	useEffect(() => {
		if (activeRoute && activeRoute.id !== SEARCH_APP_ID) {
			routesRef.current = {
				...routesRef.current,
				[activeRoute.id]: `${trim(pathname, '/')}${search}`
			};
		}
	}, [activeRoute, pathname, search]);

	const primaryBarAccessoryViews = useAppStore((s) => s.views.primaryBarAccessories);

	const accessoryViews = useMemo(
		() =>
			sortBy(
				filter(primaryBarAccessoryViews, (v) => checkRoute(v, activeRoute)),
				'position'
			),
		[activeRoute, primaryBarAccessoryViews]
	);

	const primaryBarItems = useMemo(
		() =>
			map(primaryBarViews, (view) =>
				view.visible ? (
					<PrimaryBarElement
						key={view.id}
						onClick={(): void => push(`/${routesRef.current[view.id]}`)}
						view={view}
						active={activeRoute?.id === view.id}
					/>
				) : null
			),
		[activeRoute?.id, push, primaryBarViews]
	);

	const accessoryItems = useMemo(
		() => accessoryViews.map((view) => <PrimaryBarAccessoryElement view={view} key={view.id} />),
		[accessoryViews]
	);

	return (
		<div
			style={{
				width: '100%',
				height: '100%',
				display: 'flex',
				flexDirection: 'column',

				justifyContent: 'center',
				zIndex: 1
			}}
		>
			<VeryLarge>
				<PrimaryBarContainer
					width={'fill'}
					height="fill"
					orientation="vertical"
					mainAlignment="flex-start"
					data-testid="SideMenuContainer"
				>
					<OverlayRow
						mainAlignment="flex-start"
						orientation="vertical"
						takeAvailableSpace
						wrap="nowrap"
					>
						{primaryBarItems}
						<ToggleBoardIcon />
					</OverlayRow>
					<OverlayRow mainAlignment="flex-end" orientation="vertical" wrap="nowrap">
						{accessoryItems}
					</OverlayRow>
				</PrimaryBarContainer>
			</VeryLarge>

			<Desktop>
				<PrimaryBarContainer
					width={'fill'}
					height="fill"
					orientation="vertical"
					mainAlignment="flex-start"
					data-testid="SideMenuContainer"
				>
					<OverlayRow
						mainAlignment="flex-start"
						orientation="vertical"
						takeAvailableSpace
						wrap="nowrap"
					>
						{primaryBarItems}
						<ToggleBoardIcon />
					</OverlayRow>
					<OverlayRow mainAlignment="flex-end" orientation="vertical" wrap="nowrap">
						{accessoryItems}
					</OverlayRow>
				</PrimaryBarContainer>
			</Desktop>
			<Mobile>
				<Card raised style={{ width: '100%', height: '100%' }}>
					<PrimaryBarContainer
						width="fill"
						height="fill"
						background={'white'}
						orientation="horizontal"
						mainAlignment="space-between"
						data-testid="SideMenuContainer"
					>
						<OverlayRow
							mainAlignment="space-around"
							orientation="horizontal"
							takeAvailableSpace
							wrap="nowrap"
							width="fill"
						>
							{primaryBarItems}
							<ToggleBoardIcon />
						</OverlayRow>
						<OverlayRow mainAlignment="flex-end" orientation="vertical" wrap="nowrap">
							{accessoryItems}
						</OverlayRow>
					</PrimaryBarContainer>
				</Card>
			</Mobile>
		</div>
	);
};

export default ShellPrimaryBar;

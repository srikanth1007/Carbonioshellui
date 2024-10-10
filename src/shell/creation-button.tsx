/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { FC } from 'react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import {
	Button,
	Container,
	Dropdown,
	type DropdownItem,
	MultiButton
} from '@zextras/carbonio-design-system';
import type { Location } from 'history';
import { find, groupBy, noop, reduce } from 'lodash';
import { useLocation } from 'react-router-dom';

import { ACTION_TYPES } from '../constants';
import { useCurrentRoute } from '../history/hooks';
import { useAppList } from '../store/app';
import { getT } from '../store/i18n/hooks';
import { useActions } from '../store/integrations/hooks';
import type { AppRoute, CarbonioModule } from '../types/apps';
import { Card, Divider, Menu, MenuItem, Typography } from '@mui/material';
import { ArrowDownward } from '@mui/icons-material';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import CreateIcon from '@mui/icons-material/Create';
import Desktop from '../sruvi/Desktop';
import { FOREGROUND_COLOR, PRIMARY_ICON_COLOR_ACTIVE } from '../sruvi/EditedColors';
import Mobile from '../sruvi/Mobile';
import { useUtilityBarStore } from '../utility-bar/store';
import VeryLarge from '../sruvi/VeryLarge';

interface CreationButtonProps {
	activeRoute: AppRoute;
	location: Location;
}

export const CreationButtonComponent = ({
	activeRoute,
	location
}: CreationButtonProps): React.JSX.Element => {
	const t = getT();
	const actions = useActions({ activeRoute, location }, ACTION_TYPES.NEW);

	const primaryAction = useMemo(
		() =>
			find(
				actions,
				(action) =>
					(action.group === activeRoute?.id || action.group === activeRoute?.app) &&
					action.primary === true
			),
		[actions, activeRoute?.app, activeRoute?.id]
	);
	const apps = useAppList();
	const byApp = useMemo(() => groupBy(actions, 'group'), [actions]);

	const secondaryActions = useMemo<DropdownItem[]>(
		(): DropdownItem[] => [
			...(byApp[activeRoute?.app ?? ''] ?? []),
			...reduce<CarbonioModule, DropdownItem[]>(
				apps,
				(acc, app, i): DropdownItem[] => {
					if (app.name !== activeRoute?.app && byApp[app.name]?.length > 0) {
						acc.push({ type: 'divider', label: '', id: `divider-${i}` }, ...byApp[app.name]);
					}
					return acc;
				},
				[]
			)
		],
		[activeRoute?.app, apps, byApp]
	);

	const [open, setOpen] = useState(false);
	const [setting, setsettinOpen] = useState(false);

	const isOpen = useUtilityBarStore((s) => s.secondaryBarState);

	const [barisopen, setbarisopen] = React.useState(false);

	useEffect(() => {
		if (isOpen) {
			setbarisopen(true);
		} else {
			setbarisopen(false);
		}
	}, [isOpen]);

	// 	return primaryAction ? (
	// 		<Container minWidth="80px">
	// 			<MultiButton
	// 				data-testid="NewItemButton"
	// 				size="extralarge"
	// 				background={'primary'}
	// 				label={t('new', 'New')}
	// 				onClick={primaryAction.onClick || primaryAction.click || noop}
	// 				items={secondaryActions}
	// 				disabledPrimary={!primaryAction || primaryAction?.disabled}
	// 				disabledSecondary={!secondaryActions?.length}
	// 			/>
	// 		</Container>
	// 	) : (
	// 		<Dropdown items={secondaryActions} onClose={onClose} onOpen={onOpen}>
	// 			<Button
	// 				data-testid="NewItemButton"
	// 				size="extralarge"
	// 				backgroundColor="primary"
	// 				label={t('new', 'New')}
	// 				icon={open ? 'ChevronUp' : 'ChevronDown'}
	// 				onClick={noop}
	// 			/>
	// 		</Dropdown>
	// 	);
	// };

	return primaryAction ? (
		<div>
			{barisopen ? (
				<div>
					<Desktop>
						<Card
							raised
							sx={{
								backgroundColor: FOREGROUND_COLOR,
								display: 'flex',
								flexDirection: 'row',
								marginLeft: '16px',
								width: 'fit-content',
								cursor: 'pointer',
								borderRadius: '16px'
							}}
						>
							<div
								style={{
									display: 'flex',
									alignItems: 'center',
									flexDirection: 'row',
									padding: '16px',
									paddingBottom: '16px'
								}}
								onClick={primaryAction.onClick || primaryAction.click || noop}
							>
								<CreateIcon style={{ marginRight: '0.5rem', color: PRIMARY_ICON_COLOR_ACTIVE }} />
								<Typography variant="subtitle1" style={{ color: '#000000' }}>
									Compose
								</Typography>
							</div>

							<Divider style={{ height: '100%', width: '1px', padding: '0', margin: '0' }} />
							<div
								style={{
									display: 'flex',
									alignItems: 'center',
									flexDirection: 'row',
									padding: '2px',

									justifyContent: 'center'
								}}
								onClick={(e) => setOpen(!open)}
							>
								<ArrowDropDownIcon style={{ color: PRIMARY_ICON_COLOR_ACTIVE }} />
							</div>
							<Menu
								id="basic-menu"
								anchorReference="anchorPosition"
								anchorPosition={{ top: 175, left: 0 }}
								anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
								transformOrigin={{ vertical: 'top', horizontal: 'left' }}
								open={open}
								onClose={() => setOpen(false)}
							>
								{secondaryActions.map((action) => {
									if (action.label === 'New Chat') return null;
									return (
										<MenuItem
											key={action.id}
											onClick={action.onClick || noop}
											disabled={action.disabled}
										>
											{action.label}
										</MenuItem>
									);
								})}
							</Menu>
						</Card>
					</Desktop>
					<VeryLarge>
						<Card
							raised
							sx={{
								backgroundColor: FOREGROUND_COLOR,
								display: 'flex',
								flexDirection: 'row',
								marginLeft: '16px',
								width: 'fit-content',
								cursor: 'pointer',
								borderRadius: '16px'
							}}
						>
							<div
								style={{
									display: 'flex',
									alignItems: 'center',
									flexDirection: 'row',
									padding: '16px',
									paddingBottom: '16px'
								}}
								onClick={primaryAction.onClick || primaryAction.click || noop}
							>
								<CreateIcon style={{ marginRight: '0.5rem', color: PRIMARY_ICON_COLOR_ACTIVE }} />
								<Typography variant="subtitle1" style={{ color: '#000000' }}>
									Compose
								</Typography>
							</div>

							<Divider style={{ height: '100%', width: '1px', padding: '0', margin: '0' }} />
							<div
								style={{
									display: 'flex',
									alignItems: 'center',
									flexDirection: 'row',
									padding: '2px',

									justifyContent: 'center'
								}}
								onClick={(e) => setOpen(!open)}
							>
								<ArrowDropDownIcon style={{ color: PRIMARY_ICON_COLOR_ACTIVE }} />
							</div>
							<Menu
								id="basic-menu"
								anchorReference="anchorPosition"
								anchorPosition={{ top: 175, left: 0 }}
								anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
								transformOrigin={{ vertical: 'top', horizontal: 'left' }}
								open={open}
								onClose={() => setOpen(false)}
							>
								{secondaryActions.map((action) => {
									if (action.label === 'New Chat') return null;
									return (
										<MenuItem
											key={action.id}
											onClick={action.onClick || noop}
											disabled={action.disabled}
										>
											{action.label}
										</MenuItem>
									);
								})}
							</Menu>
						</Card>
					</VeryLarge>
					<Mobile>
						<Card
							raised
							sx={{
								backgroundColor: FOREGROUND_COLOR,
								display: 'flex',
								flexDirection: 'row',
								marginLeft: '16px',
								width: 'fit-content',
								cursor: 'pointer',
								borderRadius: '16px'
							}}
						>
							<div
								style={{
									display: 'flex',
									alignItems: 'center',
									flexDirection: 'row',
									padding: '16px',
									paddingBottom: '16px',
									justifyContent: 'center'
								}}
								onClick={primaryAction.onClick || primaryAction.click || noop}
							>
								<CreateIcon style={{ color: PRIMARY_ICON_COLOR_ACTIVE }} />
							</div>
						</Card>
					</Mobile>
				</div>
			) : (
				<Card
					raised
					sx={{
						backgroundColor: FOREGROUND_COLOR,
						display: 'flex',
						flexDirection: 'row',
						marginLeft: '16px',
						width: 'fit-content',
						cursor: 'pointer',
						borderRadius: '16px'
					}}
				>
					<div
						style={{
							display: 'flex',
							alignItems: 'center',
							flexDirection: 'row',
							padding: '16px',
							paddingBottom: '16px',
							justifyContent: 'center'
						}}
						onClick={primaryAction.onClick || primaryAction.click || noop}
					>
						<CreateIcon style={{ color: PRIMARY_ICON_COLOR_ACTIVE }} />
					</div>
				</Card>
			)}
		</div>
	) : (
		<div>
			<Card
				raised
				sx={{
					backgroundColor: FOREGROUND_COLOR,
					display: 'flex',
					flexDirection: 'column',
					marginLeft: '16px',
					width: 'fit-content',
					cursor: 'pointer',
					borderRadius: '16px'
				}}
				onClick={(e) => setOpen(!open)}
			>
				<div
					style={{
						display: 'flex',
						alignItems: 'center',
						flexDirection: 'row',
						padding: '16px',
						paddingBottom: '16px'
					}}
				>
					<CreateIcon style={{ marginRight: '0.5rem', color: PRIMARY_ICON_COLOR_ACTIVE }} />
					<Typography variant="subtitle1" style={{ color: '#000000' }}>
						Compose
					</Typography>
				</div>
				<VeryLarge>
					<Menu
						id="basic-menu"
						anchorReference="anchorPosition"
						anchorPosition={{ top: 150, left: 0 }}
						anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
						transformOrigin={{ vertical: 'top', horizontal: 'left' }}
						open={open}
						onClose={() => setOpen(false)}
					>
						{secondaryActions.map((action) => {
							if (
								action.label === 'New Chat' ||
								action.label === 'New contact group' ||
								action.label === 'Upload'
							)
								return null;
							return (
								<MenuItem
									key={action.id}
									onClick={action.onClick || noop}
									disabled={action.disabled}
								>
									{action.label}
								</MenuItem>
							);
						})}
					</Menu>
				</VeryLarge>
				<Desktop>
					<Menu
						id="basic-menu"
						anchorReference="anchorPosition"
						anchorPosition={{ top: 150, left: 0 }}
						anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
						transformOrigin={{ vertical: 'top', horizontal: 'left' }}
						open={open}
						onClose={() => setOpen(false)}
					>
						{secondaryActions.map((action) => {
							if (
								action.label === 'New Chat' ||
								action.label === 'New contact group' ||
								action.label === 'Upload'
							)
								return null;
							return (
								<MenuItem
									key={action.id}
									onClick={action.onClick || noop}
									disabled={action.disabled}
								>
									{action.label}
								</MenuItem>
							);
						})}
					</Menu>
				</Desktop>
				<Mobile>
					<Menu
						id="basic-menu"
						anchorReference="anchorPosition"
						anchorPosition={{ top: 150, left: 0 }}
						anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
						transformOrigin={{ vertical: 'top', horizontal: 'left' }}
						open={open}
						onClose={() => setOpen(false)}
					>
						{secondaryActions.map((action) => {
							if (
								action.label === 'New Chat' ||
								action.label === 'New contact group' ||
								action.label === 'Upload'
							)
								return null;
							return (
								<MenuItem
									key={action.id}
									onClick={action.onClick || noop}
									disabled={action.disabled}
								>
									{action.label}
								</MenuItem>
							);
						})}
					</Menu>
				</Mobile>
			</Card>
		</div>
	);
};

const MemoCreationButton = React.memo(CreationButtonComponent);

export const CreationButton: FC = () => {
	const locationFull = useLocation() as Location;
	const activeRoute = useCurrentRoute() as AppRoute;

	const truncateLocation = (location: Location): Location => ({
		...location,
		pathname: location?.pathname?.split('/').slice(0, 2).join('/'),
		key: ''
	});

	const location = useMemo(() => truncateLocation(locationFull), [locationFull]);
	return <MemoCreationButton activeRoute={activeRoute} location={location} />;
};

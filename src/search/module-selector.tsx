/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import type { DropdownItem } from '@zextras/carbonio-design-system';
import { Container, Row, Text, Icon, Dropdown } from '@zextras/carbonio-design-system';
import styled from 'styled-components';

import { useSearchModule } from './useSearchModule';
import { SEARCH_APP_ID } from '../constants';
import { pushHistory, useCurrentRoute } from '../history/hooks';
import { useAppStore } from '../store/app';
import { Typography } from '@mui/material';
import {
	FOREGROUND_COLOR,
	PRIMARY_ICON_COLOR_ACTIVE,
	PRIMARY_ICON_COLOR_INACTIVE
} from '../sruvi/EditedColors';

const SelectorContainer = styled(Container)<{ open?: boolean }>`
	border-right: 0.0625rem solid ${({ theme }): string => theme.palette.gray4.regular};
	cursor: pointer;
	background: ${({ theme, open }): string => theme.palette[open ? 'gray5' : 'gray6'].regular};

	&:hover {
		background: ${({ theme, open }): string => theme.palette[open ? 'gray5' : 'gray6'].hover};
	}
`;

export const ModuleSelector = (): React.JSX.Element | null => {
	const currentRoute = useCurrentRoute();
	const searchViews = useAppStore((s) => s.views.search);
	const [module, updateModule] = useSearchModule();
	const searchView = useMemo(
		() => searchViews.find((m) => m.route === module),
		[module, searchViews]
	);

	const [open, setOpen] = useState(false);

	const dropdownItems = useMemo(
		(): DropdownItem[] =>
			searchViews.map(
				({ id, label, icon, route }): DropdownItem => ({
					id,
					label,
					icon,
					onClick: (): void => {
						// open the search view and update the module of moduleSelector
						// order is important
						pushHistory({ route: SEARCH_APP_ID, path: '' });
						updateModule(route);
					}
				})
			),
		[searchViews, updateModule]
	);

	useEffect(() => {
		// update the search module based on active route
		// it handles also back navigation that cannot be handled using primary icon clicks
		if (
			currentRoute?.route &&
			module !== currentRoute.route &&
			searchViews.find((m) => m.route === currentRoute.route)
		) {
			updateModule(currentRoute.route);
		}
	}, [searchView, module, searchViews, updateModule, currentRoute?.route]);

	const openDropdown = useCallback(() => {
		setOpen(true);
	}, []);

	const closeDropdown = useCallback(() => {
		setOpen(false);
	}, []);

	if (!searchView) {
		return null;
	}

	// TODO: replace the Dropdown with a Select with the customLabelFactory
	return (
		<div style={{ width: '100%', height: '48px', display: 'flex' }}>
			<Dropdown
				items={dropdownItems}
				onOpen={openDropdown}
				onClose={closeDropdown}
				style={{
					width: '100%',
					height: '48px',
					display: 'flex',
					alignItems: 'center',
					flexDirection: 'row',
					justifyContent: 'space-between'
				}}
			>
				<div
					style={{
						display: 'flex',
						alignItems: 'center',
						flexDirection: 'row',
						width: '100%',
						height: '48px',
						justifyContent: 'space-between',
						backgroundColor: FOREGROUND_COLOR
					}}
				>
					<Typography variant="body2" style={{ marginLeft: '16px' }}>
						{searchView?.label}
					</Typography>

					<Icon
						size="large"
						icon={open ? 'ChevronUpOutline' : 'ChevronDownOutline'}
						color={open ? PRIMARY_ICON_COLOR_ACTIVE : PRIMARY_ICON_COLOR_INACTIVE}
						style={{ marginRight: '8px' }}
					/>
				</div>
			</Dropdown>
		</div>
	);
};
{
	/* <SelectorContainer
				data-testid="HeaderModuleSelector"
				orientation="horizontal"
				height="40px"
				width="fit"
				minWidth="9.375rem"
				crossAlignment="center"
				mainAlignment="space-between"
				borderRadius="half"
			>
				<Row takeAvailableSpace mainAlignment="unset" padding={{ left: 'small' }}>
					<Text size="small" color={open ? 'primary' : 'text'}>
						{searchView?.label}
					</Text>
				</Row>
				<Icon
					size="large"
					icon={open ? 'ChevronUpOutline' : 'ChevronDownOutline'}
					color={open ? 'primary' : 'text'}
					style={{ alignSelf: 'center' }}
				/>
			</SelectorContainer> */
}

/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { useCallback, useMemo } from 'react';

import { Chip, Container, Divider, Icon, Padding, Text } from '@zextras/carbonio-design-system';
import { map } from 'lodash';

import { useSearchStore } from './search-store';
import { useSearchModule } from './useSearchModule';
import AppContextProvider from '../boot/app/app-context-provider';
import { RESULT_LABEL_TYPE } from '../constants';
import { useAppStore } from '../store/app';
import { getT } from '../store/i18n/hooks';
import { type SearchState } from '../types/search';
import type { ValueOf } from '../utils/typeUtils';
import { Button, Grid2, Typography } from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';
import {
	CENTER_CONTENT_BUTTON_BACKGROUND_COLOR,
	CENTER_CONTENT_BUTTON_ICON_COLOR,
	CENTER_CONTENT_BUTTON_TEXT_COLOR
} from '../sruvi/EditedColors';

const useQuery = (): [query: SearchState['query'], updateQuery: SearchState['updateQuery']] =>
	useSearchStore((s) => [s.query, s.updateQuery]);

const useDisableSearch = (): [
	isDisabled: SearchState['searchDisabled'],
	setDisabled: SearchState['setSearchDisabled']
] => useSearchStore((s) => [s.searchDisabled, s.setSearchDisabled]);

const getIconAndColor = (
	labelType: ValueOf<typeof RESULT_LABEL_TYPE>
): [icon: string, color: string] => {
	if (labelType === RESULT_LABEL_TYPE.warning) {
		return ['AlertTriangle', 'warning'];
	}
	if (labelType === RESULT_LABEL_TYPE.error) {
		return ['CloseSquare', 'error'];
	}
	return ['', ''];
};

interface ResultsHeaderProps {
	label: string;
	labelType?: ValueOf<typeof RESULT_LABEL_TYPE>;
}

const ResultsHeader = ({
	label,
	labelType = RESULT_LABEL_TYPE.normal
}: ResultsHeaderProps): React.JSX.Element => {
	const t = getT();
	const [query, updateQuery] = useQuery();
	const [, setDisabled] = useDisableSearch();

	const resetQuery = useCallback(() => {
		updateQuery([]);
		setDisabled(false);
	}, [updateQuery, setDisabled]);

	const labelTypeElem = useMemo<React.JSX.Element>(() => {
		if (labelType === RESULT_LABEL_TYPE.normal) {
			return <></>;
		}

		const [icon, color] = getIconAndColor(labelType);
		return (
			<Padding right="small">
				<Icon icon={icon} size="large" color={color} />
			</Padding>
		);
	}, [labelType]);

	const chipItems = useMemo(
		() =>
			map(query, (queryChip, index) => (
				<Padding key={`${index}${queryChip.label}`} all="extrasmall">
					<Chip {...queryChip} background={'gray5'} />
				</Padding>
			)),
		[query]
	);

	return (
		<div style={{ display: 'flex', width: '100%', maxHeight: '7.5rem' }}>
			<Grid2 container sx={{ width: '100%', height: '100%' }}>
				<Grid2 size={8} sx={{ padding: '16px' }}>
					<div style={{ display: 'flex', flexDirection: 'row' }}>
						{labelTypeElem}
						<Typography variant="body1" style={{ marginLeft: '8px' }}>
							{label}
						</Typography>
						{chipItems}
					</div>
				</Grid2>
				<Grid2 size={4} sx={{ padding: '16px' }}>
					<div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end' }}>
						{query?.length > 0 && (
							<Button
								onClick={resetQuery}
								variant="contained"
								startIcon={<ClearIcon style={{ color: CENTER_CONTENT_BUTTON_ICON_COLOR }} />}
								sx={{
									backgroundColor: CENTER_CONTENT_BUTTON_BACKGROUND_COLOR,
									color: CENTER_CONTENT_BUTTON_TEXT_COLOR
								}}
							>
								{t('label.clear_search_query', 'CLEAR SEARCH')}
							</Button>
						)}
					</div>
				</Grid2>
				<Grid2>
					<Divider color="gray3" />
				</Grid2>
			</Grid2>
		</div>

		// <>
		// 	<Container
		// 		orientation="horizontal"
		// 		mainAlignment="flex-start"
		// 		width="100%"
		// 		background={'white'}
		// 		height="fit"
		// 		minHeight="3rem"
		// 		maxHeight="7.5rem"
		// 		style={{ overflow: 'hidden', borderRadius: '16px' }}
		// 		padding={{ horizontal: 'large', vertical: 'medium' }}
		// 	>
		// 		<Container width="85%" orientation="horizontal" wrap="wrap" mainAlignment="flex-start">
		// 			{labelTypeElem}
		// 			<Text color="secondary">{label}</Text>
		// 			{chipItems}
		// 		</Container>
		// 		{query?.length > 0 && (
		// 			<Container width="15%" mainAlignment="flex-start" crossAlignment="flex-start">
		// 				<Button
		// 					label={t('label.clear_search_query', 'CLEAR SEARCH')}
		// 					icon="CloseOutline"
		// 					color="primary"
		// 					width="fill"
		// 					type="ghost"
		// 					onClick={resetQuery}
		// 				/>
		// 			</Container>
		// 		)}
		// 	</Container>
		// 	<Divider color="gray3" />
		// </>
	);
};

export const SearchAppView = (): React.JSX.Element => {
	const searchViews = useAppStore((s) => s.views.search);
	const [module] = useSearchModule();

	const searchView = useMemo(
		() => searchViews.find((m) => m.route === module),
		[module, searchViews]
	);

	return (
		<>
			{searchView && (
				<AppContextProvider pkg={searchView.app}>
					<searchView.component
						useQuery={useQuery}
						ResultsHeader={ResultsHeader}
						useDisableSearch={useDisableSearch}
					/>
				</AppContextProvider>
			)}
		</>
	);
};

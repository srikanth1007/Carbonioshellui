/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { useEffect, useMemo } from 'react';

import {
	Breadcrumbs,
	Container,
	type Crumb,
	Divider,
	Padding,
	Row,
	Text
} from '@zextras/carbonio-design-system';
import { useHistory, useParams } from 'react-router-dom';
import styled from 'styled-components';

import { getT } from '../../store/i18n/hooks';
import type { RouteLeavingGuardProps } from '../../ui-extras/nav-guard';
import { RouteLeavingGuard } from '../../ui-extras/nav-guard';
import { Button } from '@mui/material';
import {
	CENTER_CONTENT_BUTTON_BACKGROUND_COLOR,
	CENTER_CONTENT_BUTTON_TEXT_COLOR,
	CENTER_CONTENT_BUTTON_ICON_COLOR,
	CENTER_CONTENT_BUTTON_BACKGROUND_WARNING_COLOR,
	CENTER_CONTENT_BUTTON_TEXT_WARNING_COLOR,
	CENTER_CONTENT_BUTTON_DISABLED_BACKGROUND_WARNING_COLOR,
	CENTER_CONTENT_BUTTON_ICON_WARNING_COLOR,
	CENTER_CONTENT_BACKGROUND_COLOR,
	CENTER_CONTENT_BUTTON_DISABLED_BACKGROUND_COLOR
} from '../../sruvi/EditedColors';
import BackspaceIcon from '@mui/icons-material/Backspace';
import BookmarksIcon from '@mui/icons-material/Bookmarks';

const CustomBreadcrumbs = styled(Breadcrumbs)`
	.breadcrumbCrumb {
		cursor: default;
	}
`;

export type SettingsHeaderProps = {
	title: string;
	onSave: RouteLeavingGuardProps['onSave'];
	onCancel: () => void;
	isDirty: boolean;
};

export const SettingsHeader = ({
	onSave,
	onCancel,
	isDirty,
	title
}: SettingsHeaderProps): React.JSX.Element => {
	const t = getT();
	const history = useHistory();
	const params = useParams();
	const crumbs = useMemo(
		(): Crumb[] => [
			{
				id: 'settings',
				label: t('settings.app', 'Settings'),
				className: 'breadcrumbCrumb'
			},
			{
				id: 'general',
				label: title,
				className: 'breadcrumbCrumb'
			}
		],
		[t, title]
	);

	const search: string | undefined = history.location?.search;

	useEffect(() => {
		if (search) {
			// TODO: why not using anchor links instead of js?
			setTimeout(
				() =>
					document
						.querySelector(`#${history.location.search}`.replace('?section=', ''))
						?.scrollIntoView(),
				1
			);
		}
	}, [history, history.location, history.location.search, search, params]);
	return (
		<>
			<RouteLeavingGuard when={isDirty} onSave={onSave}>
				<Text>
					{t(
						'label.unsaved_changes_line1',
						'Are you sure you want to leave this page without saving?'
					)}
				</Text>
				<Text>{t('label.unsaved_changes_line2', 'All your unsaved changes will be lost')}</Text>
			</RouteLeavingGuard>

			<div
				style={{
					display: 'flex',
					justifyContent: 'space-between',
					width: '100%',
					alignItems: 'center',

					flexDirection: 'row',
					backgroundColor: CENTER_CONTENT_BACKGROUND_COLOR
				}}
			>
				<div
					style={{
						width: '100%',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'space-between',
						padding: '16px'
					}}
				>
					<div style={{ marginLeft: '8px' }}>
						<CustomBreadcrumbs crumbs={crumbs} />
					</div>

					<div
						style={{
							display: 'flex',
							alignItems: 'center',
							flexDirection: 'row',
							marginRight: '8px'
						}}
					>
						<Button
							variant="contained"
							size="medium"
							onClick={onCancel}
							disabled={!isDirty}
							style={{
								backgroundColor: isDirty
									? CENTER_CONTENT_BUTTON_BACKGROUND_WARNING_COLOR
									: CENTER_CONTENT_BUTTON_DISABLED_BACKGROUND_WARNING_COLOR,
								color: CENTER_CONTENT_BUTTON_TEXT_WARNING_COLOR,
								marginRight: '8px'
							}}
							startIcon={
								<BackspaceIcon style={{ color: CENTER_CONTENT_BUTTON_ICON_WARNING_COLOR }} />
							}
						>
							{t('label.discard_changes', 'DISCARD')}
						</Button>
						<Button
							variant="contained"
							size="medium"
							onClick={onSave}
							disabled={!isDirty}
							style={{
								backgroundColor: isDirty
									? CENTER_CONTENT_BUTTON_BACKGROUND_COLOR
									: CENTER_CONTENT_BUTTON_DISABLED_BACKGROUND_COLOR,
								color: CENTER_CONTENT_BUTTON_TEXT_COLOR
							}}
							startIcon={<BookmarksIcon style={{ color: CENTER_CONTENT_BUTTON_ICON_COLOR }} />}
						>
							{t('label.save', 'Save')}
						</Button>
					</div>
				</div>
			</div>

			{/* <Container
				orientation="vertical"
				mainAlignment="space-around"
				background={'white'}
				height="fit"
			>
				<Row orientation="horizontal" width="100%">
					<Row
						padding={{ all: 'small' }}
						mainAlignment="flex-start"
						width="50%"
						crossAlignment="flex-start"
					>
						
					</Row>
					<Row
						padding={{ all: 'small' }}
						width="50%"
						mainAlignment="flex-end"
						crossAlignment="flex-end"
					>
						<Padding right="small">
							<Button
								label={t('label.discard_changes', 'DISCARD CHANGES')}
								onClick={onCancel}
								color="secondary"
								disabled={!isDirty}
							/>
						</Padding>
						<Button
							label={t('label.save', 'Save')}
							color="primary"
							onClick={onSave}
							disabled={!isDirty}
						/>
					</Row>
				</Row>
			</Container> */}
			<Divider />
		</>
	);
};

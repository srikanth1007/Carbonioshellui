/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { useMemo } from 'react';

import { FormSubSection } from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';

import { logout } from '../../../network/logout';
import { accountSubSection } from '../../general-settings-sub-sections';
import { Button } from '@mui/material';
import {
	CENTER_CONTENT_BUTTON_BACKGROUND_WARNING_COLOR,
	CENTER_CONTENT_BUTTON_TEXT_WARNING_COLOR,
	CENTER_CONTENT_BUTTON_DISABLED_BACKGROUND_WARNING_COLOR,
	CENTER_CONTENT_BUTTON_ICON_WARNING_COLOR
} from '../../../sruvi/EditedColors';
import LogoutIcon from '@mui/icons-material/Logout';

export const Logout = (): React.JSX.Element => {
	const [t] = useTranslation();

	const sectionTitle = useMemo(() => accountSubSection(t), [t]);

	return (
		<FormSubSection
			label={sectionTitle.label}
			minWidth="calc(min(100%, 32rem))"
			width="100%"
			id={sectionTitle.id}
		>
			<Button
				variant="contained"
				size="medium"
				onClick={logout}
				style={{
					backgroundColor: CENTER_CONTENT_BUTTON_BACKGROUND_WARNING_COLOR,
					color: CENTER_CONTENT_BUTTON_TEXT_WARNING_COLOR
				}}
				startIcon={<LogoutIcon style={{ color: CENTER_CONTENT_BUTTON_ICON_WARNING_COLOR }} />}
			>
				{t('settings.general.account_logout', 'Logout')}
			</Button>
		</FormSubSection>
	);
};

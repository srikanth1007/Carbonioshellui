/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import type {
	SelectItem,
	SingleSelectionOnChange,
	TextAreaProps
} from '@zextras/carbonio-design-system';
import {
	Checkbox,
	Container,
	FormSubSection,
	Padding,
	Row,
	Select,
	Text,
	TextArea
} from '@zextras/carbonio-design-system';
import { type TFunction } from 'i18next';
import { find } from 'lodash';

import { OutOfOfficeTimePeriodSection } from './out-of-office-time-period-section';
import { getT } from '../../../store/i18n/hooks';
import type { AccountSettings, AccountSettingsPrefs, BooleanString } from '../../../types/account';
import type { AddMod } from '../../../types/network';
import { outOfOfficeSubSection } from '../../general-settings-sub-sections';
import { useReset } from '../../hooks/use-reset';
import type { ResetComponentImperativeHandler, SettingsSectionProps } from '../utils';
import { dateToGenTime, upsertPrefOnUnsavedChanges } from '../utils';
import {
	CENTER_CONTENT_SELECT_DROPDOWN_COLOR,
	CENTER_CONTENT_SELECT_DROPDOWN_DISABLED_COLOR
} from '../../../sruvi/EditedColors';
import { FormControl, Grid2, InputLabel, OutlinedInput, TextField } from '@mui/material';

type CoercedPrefType<T> = T extends BooleanString | undefined ? boolean | undefined : T;

export const buildItemsPrefOutOfOfficeReplyEnabled = (
	t: TFunction
): Array<
	SelectItem<
		NonNullable<CoercedPrefType<AccountSettingsPrefs['zimbraPrefOutOfOfficeReplyEnabled']>>
	>
> => [
	{
		label: t('settings.out_of_office.send_auto_replies', 'Send auto-replies'),
		value: true
	},
	{
		label: t('settings.out_of_office.do_not_send_auto_replies', 'Do not send auto-replies'),
		value: false
	}
];

type ExternalSenders =
	| 'SEND_AUTO_REPLY'
	| 'SHOW_EXTERNAL_INPUT'
	| 'SEND_NOT_IN_ORG'
	| 'SUPPRESS_EXTERNAL';

export const buildItemsExternalSenders = (
	t: TFunction
): Record<ExternalSenders, SelectItem<ExternalSenders>> => ({
	SEND_AUTO_REPLY: {
		label: t(
			'settings.out_of_office.external_senders.send_standard_auto_reply',
			'Send standard auto-reply message'
		),
		value: 'SEND_AUTO_REPLY'
	},
	SHOW_EXTERNAL_INPUT: {
		label: t(
			'settings.out_of_office.external_senders.send_custom_in_organisation',
			'Send custom message to those who are not in my organization'
		),
		value: 'SHOW_EXTERNAL_INPUT'
	},
	SEND_NOT_IN_ORG: {
		label: t(
			'settings.out_of_office.external_senders.send_custom_not_in_organisation',
			'Send custom message to those who are not in my organization or address book'
		),
		value: 'SEND_NOT_IN_ORG'
	},
	SUPPRESS_EXTERNAL: {
		label: t(
			'settings.out_of_office.external_senders.do_not_send_to_external',
			"Don't send an auto-reply message to external sender"
		),
		value: 'SUPPRESS_EXTERNAL'
	}
});

export const getExternalSendersPrefsData = (
	settings: AccountSettings,
	t: TFunction
): SelectItem<ExternalSenders> => {
	const itemsExternalSenders = buildItemsExternalSenders(t);
	if (
		settings.prefs.zimbraPrefOutOfOfficeSuppressExternalReply === 'FALSE' &&
		settings.prefs.zimbraPrefOutOfOfficeExternalReplyEnabled === 'FALSE'
	) {
		return itemsExternalSenders.SEND_AUTO_REPLY;
	}
	if (
		settings.prefs.zimbraPrefExternalSendersType === 'ALL' &&
		settings.prefs.zimbraPrefOutOfOfficeExternalReplyEnabled === 'TRUE'
	) {
		return itemsExternalSenders.SHOW_EXTERNAL_INPUT;
	}
	if (
		settings.prefs.zimbraPrefExternalSendersType === 'ALLNOTINAB' &&
		settings.prefs.zimbraPrefOutOfOfficeExternalReplyEnabled === 'TRUE'
	) {
		return itemsExternalSenders.SEND_NOT_IN_ORG;
	}
	return itemsExternalSenders.SUPPRESS_EXTERNAL;
};

interface OutOfOfficeViewProps extends SettingsSectionProps {
	settings: AccountSettings;
	addMod: AddMod;
}

export const OutOfOfficeSettings = ({
	settings,
	addMod,
	resetRef
}: OutOfOfficeViewProps): React.JSX.Element => {
	const t = getT();
	const outOfOfficeSectionTitle = useMemo(() => outOfOfficeSubSection(t), [t]);
	const [prefOutOfOfficeReplyEnabled, setPrefOutOfOfficeReplyEnabled] = useState<boolean>(
		settings.prefs.zimbraPrefOutOfOfficeReplyEnabled === 'TRUE'
	);
	const [prefOutOfOfficeReply, setPrefOutOfOfficeReply] = useState<string>(
		settings.prefs.zimbraPrefOutOfOfficeReply ?? ''
	);
	const [prefOutOfOfficeExternalReplyEnabled, setPrefOutOfOfficeExternalReplyEnabled] =
		useState<boolean>(settings.prefs.zimbraPrefOutOfOfficeExternalReplyEnabled === 'TRUE');
	const [prefOutOfOfficeExternalReply, setPrefOutOfOfficeExternalReply] = useState<string>(
		settings.prefs.zimbraPrefOutOfOfficeExternalReply ?? ''
	);
	const [externalSendersSelectedItem, setExternalSendersSelectedItem] = useState<
		SelectItem<ExternalSenders>
	>(getExternalSendersPrefsData(settings, t));
	const [sendAutoReplyTimePeriodEnabled, setSendAutoReplyTimePeriodEnabled] = useState<boolean>(
		!!settings.prefs.zimbraPrefOutOfOfficeFromDate &&
			!!settings.prefs.zimbraPrefOutOfOfficeUntilDate
	);

	const outOfOfficeTimePeriodResetRef = useRef<ResetComponentImperativeHandler>(null);

	const initPrefs = useCallback(() => {
		setPrefOutOfOfficeReplyEnabled(settings.prefs.zimbraPrefOutOfOfficeReplyEnabled === 'TRUE');
		setPrefOutOfOfficeReply(settings.prefs.zimbraPrefOutOfOfficeReply ?? '');
		setPrefOutOfOfficeExternalReplyEnabled(
			settings.prefs.zimbraPrefOutOfOfficeExternalReplyEnabled === 'TRUE'
		);
		setPrefOutOfOfficeExternalReply(settings.prefs.zimbraPrefOutOfOfficeExternalReply ?? '');
		setExternalSendersSelectedItem(getExternalSendersPrefsData(settings, t));
		setSendAutoReplyTimePeriodEnabled(
			!!settings.prefs.zimbraPrefOutOfOfficeFromDate &&
				!!settings.prefs.zimbraPrefOutOfOfficeUntilDate
		);
		outOfOfficeTimePeriodResetRef.current?.reset();
	}, [settings, t]);

	useEffect(() => {
		initPrefs();
	}, [initPrefs]);

	useReset(resetRef, initPrefs);

	const updatePref = useMemo(() => upsertPrefOnUnsavedChanges(addMod), [addMod]);

	const prefOutOfOfficeReplyEnabledSelectItems = useMemo(
		() => buildItemsPrefOutOfOfficeReplyEnabled(t),
		[t]
	);

	const prefOutOfOfficeReplyEnabledSelectedValue = useMemo<SelectItem<boolean>>(
		() =>
			find(
				prefOutOfOfficeReplyEnabledSelectItems,
				(item) => item.value === prefOutOfOfficeReplyEnabled
			) as SelectItem<boolean>,
		[prefOutOfOfficeReplyEnabled, prefOutOfOfficeReplyEnabledSelectItems]
	);

	const prefOutOfOfficeReplyEnabledOnChange = useCallback<
		SingleSelectionOnChange<
			NonNullable<CoercedPrefType<AccountSettingsPrefs['zimbraPrefOutOfOfficeReplyEnabled']>>
		>
	>(
		(value): void => {
			if (value !== null) {
				updatePref('zimbraPrefOutOfOfficeReplyEnabled', value);
				setPrefOutOfOfficeReplyEnabled(value);
			}
		},
		[updatePref]
	);

	const externalSendersSelectItems = useMemo(
		() => Object.values(buildItemsExternalSenders(t)),
		[t]
	);

	const externalSendersHandler = useCallback(
		(value: ExternalSenders) => {
			if (value === 'SEND_AUTO_REPLY') {
				updatePref('zimbraPrefExternalSendersType', 'INSD');
				updatePref('zimbraPrefOutOfOfficeExternalReplyEnabled', false);
				updatePref('zimbraPrefOutOfOfficeSuppressExternalReply', false);
				setPrefOutOfOfficeExternalReplyEnabled(false);
			} else if (value === 'SHOW_EXTERNAL_INPUT') {
				updatePref('zimbraPrefExternalSendersType', 'ALL');
				updatePref('zimbraPrefOutOfOfficeExternalReplyEnabled', true);
				updatePref('zimbraPrefOutOfOfficeSuppressExternalReply', false);
				setPrefOutOfOfficeExternalReplyEnabled(true);
			} else if (value === 'SEND_NOT_IN_ORG') {
				updatePref('zimbraPrefExternalSendersType', 'ALLNOTINAB');
				updatePref('zimbraPrefOutOfOfficeExternalReplyEnabled', true);
				updatePref('zimbraPrefOutOfOfficeSuppressExternalReply', false);
				setPrefOutOfOfficeExternalReplyEnabled(true);
			} else if (value === 'SUPPRESS_EXTERNAL') {
				updatePref('zimbraPrefExternalSendersType', 'INAB');
				updatePref('zimbraPrefOutOfOfficeExternalReplyEnabled', false);
				updatePref('zimbraPrefOutOfOfficeSuppressExternalReply', true);
				setPrefOutOfOfficeExternalReplyEnabled(false);
			}
		},
		[updatePref]
	);

	const externalSendersOnChange = useCallback<SingleSelectionOnChange<ExternalSenders>>(
		(value) => {
			if (value !== null) {
				externalSendersHandler(value);
				const newSelectItem = find(externalSendersSelectItems, (item) => item.value === value);
				newSelectItem && setExternalSendersSelectedItem(newSelectItem);
			}
		},
		[externalSendersHandler, externalSendersSelectItems]
	);

	const prefOutOfOfficeReplyOnChange = useCallback<NonNullable<TextAreaProps['onChange']>>(
		(ev) => {
			setPrefOutOfOfficeReply(ev.target.value);
			updatePref('zimbraPrefOutOfOfficeReply', ev.target.value);
		},
		[updatePref]
	);

	const prefOutOfOfficeExternalReplyOnChange = useCallback<NonNullable<TextAreaProps['onChange']>>(
		(ev) => {
			setPrefOutOfOfficeExternalReply(ev.target.value);
			updatePref('zimbraPrefOutOfOfficeExternalReply', ev.target.value);
		},
		[updatePref]
	);

	const toggleSendAutoReplyTimePeriod = useCallback(() => {
		setSendAutoReplyTimePeriodEnabled((prevState) => {
			const nextState = !prevState;
			if (!nextState) {
				updatePref('zimbraPrefOutOfOfficeFromDate', undefined);
				updatePref('zimbraPrefOutOfOfficeUntilDate', undefined);
			} else {
				if (!settings.prefs.zimbraPrefOutOfOfficeFromDate) {
					updatePref('zimbraPrefOutOfOfficeFromDate', dateToGenTime(new Date()));
				}
				if (!settings.prefs.zimbraPrefOutOfOfficeUntilDate) {
					updatePref('zimbraPrefOutOfOfficeUntilDate', dateToGenTime(new Date()));
				}
			}
			return nextState;
		});
	}, [
		settings.prefs.zimbraPrefOutOfOfficeFromDate,
		settings.prefs.zimbraPrefOutOfOfficeUntilDate,
		updatePref
	]);

	return (
		<FormSubSection
			label={outOfOfficeSectionTitle.label}
			minWidth="calc(min(100%, 32rem))"
			width="100%"
			id={outOfOfficeSectionTitle.id}
		>
			<Container crossAlignment="baseline" padding={{ all: 'small' }} gap={'0.5rem'}>
				<Grid2 container spacing={4} sx={{ width: '100%' }}>
					<Grid2 size={6}>
						<div style={{ width: '100%' }}>
							<Select
								items={prefOutOfOfficeReplyEnabledSelectItems}
								label={t('label.out_of_office', 'Out of Office')}
								onChange={prefOutOfOfficeReplyEnabledOnChange}
								selection={prefOutOfOfficeReplyEnabledSelectedValue}
								style={{ width: '100%', border: '1px solid lightgray' }}
								background={CENTER_CONTENT_SELECT_DROPDOWN_COLOR}
								dropdownWidth="100%"
							/>
						</div>
					</Grid2>
					<Grid2 size={6}>
						<div style={{ width: '100%' }}>
							<Select
								disabled={!prefOutOfOfficeReplyEnabled}
								items={externalSendersSelectItems}
								label={t('settings.out_of_office.labels.external_senders', 'External Senders')}
								onChange={externalSendersOnChange}
								selection={externalSendersSelectedItem}
								dropdownWidth={'auto'}
								dropdownMaxWidth={'unset'}
								placement={'bottom-start'}
								background={
									prefOutOfOfficeReplyEnabled
										? CENTER_CONTENT_SELECT_DROPDOWN_COLOR
										: CENTER_CONTENT_SELECT_DROPDOWN_DISABLED_COLOR
								}
								style={{ width: '100%', border: '1px solid lightgray' }}
							/>
						</div>
					</Grid2>
					<Grid2 size={12}>
						<TextField
							label={t('settings.out_of_office.labels.auto_reply_message', 'Auto-Reply Message:')}
							multiline
							rows={4}
							sx={{
								borderColor: 'lightgray',
								backgroundColor: prefOutOfOfficeReplyEnabled
									? CENTER_CONTENT_SELECT_DROPDOWN_COLOR
									: CENTER_CONTENT_SELECT_DROPDOWN_DISABLED_COLOR
							}}
							fullWidth
							value={prefOutOfOfficeReply}
							disabled={!prefOutOfOfficeReplyEnabled}
							onChange={prefOutOfOfficeReplyOnChange}
						/>
					</Grid2>
					<Grid2 size={12}>
						{prefOutOfOfficeExternalReplyEnabled && (
							<TextField
								fullWidth
								multiline
								rows={4}
								value={prefOutOfOfficeExternalReply}
								disabled={!prefOutOfOfficeReplyEnabled}
								label={t(
									'settings.out_of_office.labels.auto_reply_message_external',
									'Auto-Reply Message for External senders:'
								)}
								onChange={prefOutOfOfficeExternalReplyOnChange}
								sx={{
									borderColor: 'lightgray',
									backgroundColor: prefOutOfOfficeReplyEnabled
										? CENTER_CONTENT_SELECT_DROPDOWN_COLOR
										: CENTER_CONTENT_SELECT_DROPDOWN_DISABLED_COLOR
								}}
							/>
						)}
					</Grid2>
				</Grid2>
				{/* <TextArea
					value={prefOutOfOfficeReply}
					disabled={!prefOutOfOfficeReplyEnabled}
					label={t('settings.out_of_office.labels.auto_reply_message', 'Auto-Reply Message:')}
					onChange={prefOutOfOfficeReplyOnChange}
				/>
				{prefOutOfOfficeExternalReplyEnabled && (
					<TextArea
						value={prefOutOfOfficeExternalReply}
						disabled={!prefOutOfOfficeReplyEnabled}
						label={t(
							'settings.out_of_office.labels.auto_reply_message_external',
							'Auto-Reply Message for External senders:'
						)}
						onChange={prefOutOfOfficeExternalReplyOnChange}
					/>
				)} */}
			</Container>
			<Container crossAlignment="baseline" padding={{ all: 'small' }}>
				<Row
					padding={{ all: 'small' }}
					mainAlignment="baseline"
					crossAlignment="baseline"
					width="100%"
				>
					<Text size="large" weight="bold">
						{t('settings.out_of_office.headings.time_period', 'Time Period')}
					</Text>
				</Row>
				<Padding vertical="small" />
				<Checkbox
					label={t(
						'settings.out_of_office.labels.send_auto_reply_period',
						'Send auto-replies during the following period:'
					)}
					value={sendAutoReplyTimePeriodEnabled}
					onClick={toggleSendAutoReplyTimePeriod}
					disabled={!prefOutOfOfficeReplyEnabled}
				/>
				<OutOfOfficeTimePeriodSection
					addMod={addMod}
					disabled={!prefOutOfOfficeReplyEnabled || !sendAutoReplyTimePeriodEnabled}
					prefOutOfOfficeFromDate={settings.prefs.zimbraPrefOutOfOfficeFromDate}
					prefOutOfOfficeUntilDate={settings.prefs.zimbraPrefOutOfOfficeUntilDate}
					resetRef={outOfOfficeTimePeriodResetRef}
				/>
			</Container>
		</FormSubSection>
	);
};

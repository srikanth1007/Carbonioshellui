/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { ReactElement } from 'react';
import React, { useMemo, useCallback, useState, useEffect } from 'react';

import type { InputProps } from '@zextras/carbonio-design-system';
import { Container, Text, Padding, Input, Row } from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';

import type { Account, Identity, IdentityAttrs } from '../../../types/account';
import { TextField } from '@mui/material';

interface PrimaryAccountSettingsProps {
	account: Account;
	identity: Identity;
	updateIdentities: <K extends keyof IdentityAttrs>(
		id: string,
		key: K,
		value: IdentityAttrs[K]
	) => void;
}

const PrimaryAccountSettings = ({
	account,
	identity,
	updateIdentities
}: PrimaryAccountSettingsProps): ReactElement => {
	const [t] = useTranslation();
	const emailLabel = useMemo(() => t('label.email_address', 'E-mail address'), [t]);
	const [accountNameValue, setAccountNameValue] = useState(
		identity?._attrs?.zimbraPrefIdentityName
	);

	useEffect(
		() => setAccountNameValue(identity._attrs?.zimbraPrefIdentityName),
		[identity._attrs?.zimbraPrefIdentityName]
	);
	const accountLabel = useMemo(() => t('label.account_name', 'Account Name'), [t]);

	const onChangeDisabled = useCallback(() => null, []);
	const onChange = useCallback<NonNullable<InputProps['onChange']>>(
		(ev): void => {
			setAccountNameValue(ev.target.value);
			updateIdentities(identity.id, 'zimbraPrefIdentityName', ev.target.value);
		},
		[identity.id, updateIdentities]
	);

	return (
		<>
			<Container
				minWidth="calc(min(100%, 32rem))"
				width="fill"
				padding={{ all: 'large' }}
				height="fit"
				background="gray6"
				mainAlignment="flex-start"
			>
				<Padding horizontal="medium" width="100%">
					<Text weight="bold">{t('primary_account.title', 'Primary Account Settings')}</Text>
				</Padding>
			</Container>
			<Row
				width="fill"
				padding={{ horizontal: 'large', bottom: 'large' }}
				height="fit"
				background="gray6"
				mainAlignment="flex-start"
			>
				<Row width="50%" padding={{ right: 'small' }}>
					<TextField
						fullWidth
						variant="outlined"
						size="medium"
						label={emailLabel}
						value={account.name || ' '}
						onChange={onChangeDisabled}
					/>
					{/* <Input label={emailLabel} value={account.name || ' '} onChange={onChangeDisabled} /> */}
				</Row>
				<Row width="50%">
					<TextField
						fullWidth
						variant="outlined"
						size="medium"
						label={accountLabel}
						value={accountNameValue}
						onChange={onChange}
					/>
					{/* <Input label={accountLabel} value={accountNameValue} onChange={onChange} /> */}
				</Row>
			</Row>
			<Padding bottom="large" />
		</>
	);
};

export default PrimaryAccountSettings;

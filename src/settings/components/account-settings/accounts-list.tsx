/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { ReactElement } from 'react';
import React, { useCallback, useRef, useMemo } from 'react';

import {
	Container,
	Text,
	Divider,
	Row,
	Padding,
	Icon,
	ListV2,
	ListItem,
	useModal
} from '@zextras/carbonio-design-system';
import type { TFunction } from 'i18next';
import { map } from 'lodash';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import type { Identity, IdentityAttrs } from '../../../types/account';
import { isPrimary } from '../utils';
import {
	CENTER_CONTENT_BACKGROUND_COLOR,
	CENTER_CONTENT_BUTTON_BACKGROUND_COLOR,
	CENTER_CONTENT_BUTTON_BACKGROUND_WARNING_COLOR,
	CENTER_CONTENT_BUTTON_DISABLED_BACKGROUND_WARNING_COLOR,
	CENTER_CONTENT_BUTTON_ICON_COLOR,
	CENTER_CONTENT_BUTTON_ICON_WARNING_COLOR,
	CENTER_CONTENT_BUTTON_TEXT_COLOR,
	CENTER_CONTENT_BUTTON_TEXT_WARNING_COLOR
} from '../../../sruvi/EditedColors';
import { Button } from '@mui/material';
import DeleteForeverRoundedIcon from '@mui/icons-material/DeleteForeverRounded';
import AddBoxRoundedIcon from '@mui/icons-material/AddBoxRounded';

const List = styled(ListV2)`
	flex-shrink: 0;
`;

function getNewPersonaNextIdentityName(
	numberToCheck: number,
	unavailableIdentityNames: Array<string>,
	t: TFunction
): string {
	const newPersonaNextIdentityName = t('settings.account.new_identity', {
		defaultValue: `New Persona {{number}}`,
		number: numberToCheck
	});
	if (unavailableIdentityNames.includes(newPersonaNextIdentityName)) {
		return getNewPersonaNextIdentityName(numberToCheck + 1, unavailableIdentityNames, t);
	}
	return newPersonaNextIdentityName;
}

export type AccountsListProps = {
	accountName: string;
	identities: Array<Identity>;
	identitiesDefault: Array<Identity>;
	selectedIdentityId: number;
	setSelectedIdentityId: (value: number) => void;
	removeIdentity: (identityId: string) => void;
	addIdentity: (id: string, identityAttrs: IdentityAttrs) => void;
};

const AccountsList = ({
	accountName,
	selectedIdentityId,
	identities,
	identitiesDefault,
	setSelectedIdentityId,
	removeIdentity,
	addIdentity
}: AccountsListProps): ReactElement => {
	const [t] = useTranslation();

	const createModal = useModal();

	const createListRequestIdRef = useRef(0);
	const addNewPersona = useCallback(() => {
		const unavailableIdentityNames = map<Identity, string>(
			[...identitiesDefault, ...identities],
			(item) => item._attrs?.zimbraPrefIdentityName ?? ''
		);
		const newPersonaName = getNewPersonaNextIdentityName(1, unavailableIdentityNames, t);

		addIdentity(`${createListRequestIdRef.current}`, {
			zimbraPrefIdentityName: newPersonaName,
			zimbraPrefFromDisplay: identities[0]._attrs?.zimbraPrefFromDisplay,
			zimbraPrefFromAddress: identities[0]._attrs?.zimbraPrefFromAddress,
			zimbraPrefFromAddressType: 'sendAs',
			zimbraPrefReplyToEnabled: 'FALSE'
		});
		createListRequestIdRef.current += 1;
		setSelectedIdentityId(identities.length);
	}, [identitiesDefault, identities, addIdentity, setSelectedIdentityId, t]);

	const onConfirmDelete = useCallback((): void => {
		removeIdentity(identities[selectedIdentityId].id);
		setSelectedIdentityId(selectedIdentityId - 1);
	}, [identities, removeIdentity, selectedIdentityId, setSelectedIdentityId]);

	const onDelete = useCallback((): void => {
		const closeModal = createModal({
			title: t('label.permanent_delete_title', 'Are you sure to permanently delete this Persona?'),
			onConfirm: () => {
				onConfirmDelete();
				closeModal();
			},
			confirmLabel: t('label.delete_permanently', 'Delete permanently'),
			confirmColor: 'error',
			showCloseIcon: true,
			onClose: () => closeModal(),
			children: (
				<Padding all="small">
					<Text overflow="break-word">
						{t(
							'messages.permanent_delete_body',
							'If you permanently delete this Persona you will not be able to recover it. Continue?'
						)}
					</Text>
				</Padding>
			)
		});
	}, [createModal, t, onConfirmDelete]);

	const items = useMemo(
		() =>
			map(identities, (item, index) => (
				<ListItem key={item.id} active={selectedIdentityId === index}>
					{(): React.JSX.Element => (
						<>
							<Container
								role={'listitem'}
								data-testid={`account-list-item-${item._attrs?.zimbraPrefIdentityId}`}
								onClick={(): void => {
									setSelectedIdentityId(index);
								}}
								orientation="horizontal"
								mainAlignment="flex-start"
								padding={{ all: 'small' }}
							>
								<Row width="fill" mainAlignment="space-between">
									<Container orientation="horizontal" mainAlignment="flex-start" width="fit">
										<Padding right="small">
											<Icon icon="CheckmarkCircle2Outline" size="large" color="primary" />
										</Padding>
										<Padding right="small">
											<Text weight="regular" size="small">
												{item._attrs?.zimbraPrefIdentityName}
											</Text>
										</Padding>
										<Padding right="small">
											<Text weight="regular" size="small" color="secondary">
												({isPrimary(item) ? accountName : item._attrs?.zimbraPrefFromAddress})
											</Text>
										</Padding>
									</Container>
									<Container width="fit" mainAlignment="flex-end">
										<Text weight="regular" size="small">
											{isPrimary(item)
												? t('label.primary', 'Primary')
												: t('label.persona', 'Persona')}
										</Text>
									</Container>
								</Row>
							</Container>
							<Divider />
						</>
					)}
				</ListItem>
			)),
		[accountName, identities, selectedIdentityId, setSelectedIdentityId, t]
	);

	return (
		<>
			<Container
				minWidth="calc(min(100%, 32rem))"
				width="fill"
				padding={{ all: 'large' }}
				height="fit"
				background={CENTER_CONTENT_BACKGROUND_COLOR}
				mainAlignment="flex-start"
			>
				<Padding horizontal="medium" bottom="large" width="100%">
					<Text weight="bold">{t('label.accounts_list', 'Accounts list')}</Text>
				</Padding>
				<List>{items}</List>
			</Container>
			<Row
				padding={{ horizontal: 'large', bottom: 'large' }}
				width="fill"
				mainAlignment="flex-start"
				background={CENTER_CONTENT_BACKGROUND_COLOR}
			>
				<Button
					variant="contained"
					size="medium"
					onClick={addNewPersona}
					style={{
						backgroundColor: CENTER_CONTENT_BUTTON_BACKGROUND_COLOR,

						color: CENTER_CONTENT_BUTTON_TEXT_COLOR
					}}
					startIcon={<AddBoxRoundedIcon style={{ color: CENTER_CONTENT_BUTTON_ICON_COLOR }} />}
				>
					{t('label.add_persona', 'Add persona')}
				</Button>

				{/* <Padding right="small">
					<Button onClick={addNewPersona} color="primary" variant="contained">
						{t('label.add_persona', 'Add persona')}
					</Button>
				</Padding> */}
				{/* <Button onClick={onDelete} disabled={isPrimary(identities[selectedIdentityId])}>
					{t('label.delete', 'Delete')}
				</Button> */}
				<Button
					disabled={isPrimary(identities[selectedIdentityId])}
					variant="contained"
					size="medium"
					onClick={onDelete}
					style={{
						backgroundColor: isPrimary(identities[selectedIdentityId])
							? CENTER_CONTENT_BUTTON_BACKGROUND_WARNING_COLOR
							: CENTER_CONTENT_BUTTON_DISABLED_BACKGROUND_WARNING_COLOR,
						color: CENTER_CONTENT_BUTTON_TEXT_WARNING_COLOR,
						marginLeft: '16px'
					}}
					startIcon={
						<DeleteForeverRoundedIcon style={{ color: CENTER_CONTENT_BUTTON_ICON_WARNING_COLOR }} />
					}
				>
					{t('label.delete', 'Delete')}
				</Button>
			</Row>
			<Padding bottom="large" />
		</>
	);
};

export default AccountsList;

/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { FC } from 'react';
import React, { useCallback, useEffect, useRef, useState } from 'react';

import type { IconProps, RowProps } from '@zextras/carbonio-design-system';
import { Container, Icon, IconButton, Row, Text, Tooltip } from '@zextras/carbonio-design-system';
import type { SimpleInterpolation } from 'styled-components';
import styled, { css } from 'styled-components';

import { closeBoard, setCurrentBoard, useBoardStore } from '../../store/boards';
import { getT } from '../../store/i18n/hooks';
import './board-tab.css';

const TabContainer = styled(Row)<RowProps & { active: boolean }>`
	container-type: inline-size;
	container-name: tab;
	max-width: calc(3rem + 15ch);
	min-width: 1rem;
	flex-grow: 1;
	flex-basis: 0;
	cursor: pointer;
	height: 1.75rem;
	user-select: none;

	gap: 0.25rem;
	border-radius: 0.25rem;
	margin-left: 0.25rem;
	margin-right: 0.25rem;
	overflow: hidden;
	${({ active }): SimpleInterpolation =>
		active &&
		css`
			min-width: calc(3rem + 15ch);
		`}
`;

const CloseContainer = styled(Container)`
	margin-left: auto;
`;

const TabIcon = styled(Icon)<{ active: boolean }>`
	min-width: 1.5rem;
	color: ${({ active }): string => (active ? '#2196F3' : 'black')};
`;

const CustomText = styled(Text)<{ overflowing: boolean }>`
	${({ overflowing }): SimpleInterpolation =>
		overflowing &&
		css`
			mask-image: linear-gradient(90deg, #000 60%, transparent);
		`}
	text-overflow: unset;
`;

const VerticalDivider = styled(Container)`
	width: 0.0625rem;
	min-width: 0.0625rem;
	height: 2.25rem;
	background: ${({ theme }): string => theme.palette.gray3.regular};
`;

export const AppBoardTab: FC<{ id: string; icon: string; title: string; firstTab: boolean }> = ({
	id,
	icon,
	title,
	firstTab
}) => {
	const current = useBoardStore((s) => s.current);
	const t = getT();
	const onClick = useCallback(
		(event: React.SyntheticEvent<HTMLDivElement>) => {
			if (!event.defaultPrevented) {
				setCurrentBoard(id);
			}
		},
		[id]
	);
	const onRemove = useCallback(
		(ev: React.SyntheticEvent | Event) => {
			if (!ev.defaultPrevented) {
				ev.stopPropagation();
				closeBoard(id);
			}
		},
		[id]
	);

	const textRef = useRef<HTMLDivElement>(null);
	const [textOverflowing, setTextOverflowing] = useState(false);
	const resizeObserverRef = useRef<ResizeObserver>();
	useEffect(() => {
		if (textRef.current && !resizeObserverRef.current) {
			resizeObserverRef.current = new ResizeObserver(() => {
				requestAnimationFrame(() => {
					if (textRef.current) {
						setTextOverflowing(textRef.current.offsetWidth < textRef.current.scrollWidth);
					}
				});
			});
			resizeObserverRef.current.observe(textRef.current);
		}

		return (): void => {
			resizeObserverRef.current?.disconnect();
		};
	}, [textRef]);

	return (
		<>
			{!firstTab && <VerticalDivider />}
			<TabContainer
				wrap={'nowrap'}
				orientation="row"
				mainAlignment={'flex-start'}
				onClick={onClick}
				data-testid={`board-tab-${id}`}
				padding={{ horizontal: 'extrasmall' }}
				active={current === id}
			>
				<TabIcon active={current === id} icon={icon} size="large" />
				<Tooltip label={title} placement="top" maxWidth="700px" triggerRef={textRef}>
					<CustomText
						size="medium"
						weight="regular"
						color={current === id ? '#2196F3' : 'secondary'}
						overflowing={textOverflowing}
						className="tab-text"
					>
						{title}
					</CustomText>
				</Tooltip>

				<CloseContainer orientation={'row'} width={'fit'}>
					<Tooltip label={t('board.close_tab', 'Close Tab')} placement="top">
						<IconButton
							className="tab-close-icon-button"
							iconColor="secondary"
							icon="Close"
							onClick={onRemove}
							style={{ padding: '0.125rem', width: '1.5rem', height: '1.5rem' }}
						/>
					</Tooltip>
				</CloseContainer>
			</TabContainer>
		</>
	);
};

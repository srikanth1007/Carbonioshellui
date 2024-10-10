/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import type { ChipInputProps } from '@zextras/carbonio-design-system';
import {
	ChipInput,
	Container,
	IconButton,
	Padding,
	Tooltip
} from '@zextras/carbonio-design-system';
import { filter, find, map, reduce, some } from 'lodash';
import { useHistory } from 'react-router-dom';
import styled from 'styled-components';

import { ModuleSelector } from './module-selector';
import { useSearchStore } from './search-store';
import { useSearchModule } from './useSearchModule';
import { LOCAL_STORAGE_SEARCH_KEY, SEARCH_APP_ID } from '../constants';
import { useLocalStorage } from '../shell/hooks/useLocalStorage';
import { useAppStore } from '../store/app';
import { getT } from '../store/i18n/hooks';
import type { QueryChip, QueryItem } from '../types/search';
import Desktop from '../sruvi/Desktop';
import { Card, Grid2 } from '@mui/material';
import {
	FOREGROUND_COLOR,
	PRIMARY_ICON_COLOR_ACTIVE,
	PRIMARY_ICON_COLOR_INACTIVE,
	RAISED_SEARCH_BAR
} from '../sruvi/EditedColors';
import VeryLarge from '../sruvi/VeryLarge';

const OutlinedIconButton = styled(IconButton)`
	display: flex;
	align-items: center;
	height: 48px;
	width: 48px;
	& svg {
		border: none;
	}
`;

const StyledChipInput = styled(ChipInput)`
	cursor: pointer;
	overflow-x: hidden;
	padding: 0 1rem;
	&:hover {
		outline: none;
		background: ${({ theme, disabled }): string =>
			disabled ? 'gray5' : 'FOREGROUND_COLOR_FOCUSED'};
	}
	height: 48px;
`;

const StyledContainer = styled(Container)`
	height: 48px;
	overflow-y: hidden;
	&:first-child {
		transform: translateY(-0.125rem);
	}
`;

type SearchOption = NonNullable<ChipInputProps['options']>[number] & QueryItem;

export const SearchBar = (): React.JSX.Element => {
	const inputRef = useRef<HTMLInputElement>(null);
	const t = getT();
	const [storedSuggestions, setStoredSuggestions] = useLocalStorage<SearchOption[]>(
		LOCAL_STORAGE_SEARCH_KEY,
		[]
	);
	const [inputTyped, setInputTyped] = useState<string>('');
	const history = useHistory();
	const [currentSearchModuleRoute] = useSearchModule();
	const { updateQuery, query, searchDisabled, setSearchDisabled, tooltip } = useSearchStore();
	const modules = useAppStore((s) => s.views.search);
	const moduleLabel = useMemo(
		() =>
			modules.find(({ route }) => route === currentSearchModuleRoute)?.label ||
			currentSearchModuleRoute,
		[currentSearchModuleRoute, modules]
	);

	const [isTyping, setIsTyping] = useState(false);

	const [options, setOptions] = useState<SearchOption[]>([]);

	const [inputHasFocus, setInputHasFocus] = useState(false);

	const [searchInputValue, setSearchInputValue] = useState<QueryChip[]>(query);

	const showClear = useMemo(
		() =>
			searchInputValue.length > 0 ||
			(inputRef.current?.value && inputRef.current?.value?.length > 0),
		[searchInputValue.length]
	);
	const clearSearch = useCallback((): void => {
		if (inputRef.current) {
			inputRef.current.value = '';
			inputRef.current?.focus();
		}
		setIsTyping(false);
		setSearchInputValue([]);
		setSearchDisabled(false);
		updateQuery([]);
		setInputTyped('');
	}, [setSearchDisabled, updateQuery]);

	const onSearch = useCallback(() => {
		updateQuery((currentQuery) => {
			const ref = inputRef?.current;
			if (ref) {
				ref.value = '';
			}
			if (inputTyped.length > 0) {
				const newInputValue: typeof searchInputValue = [
					...searchInputValue,
					...map(
						inputTyped.split(' '),
						(label, id): QueryChip => ({
							id: `${id}`,
							label,
							hasAvatar: false
						})
					)
				];
				setSearchInputValue(newInputValue);
				setInputTyped('');
				return reduce(
					newInputValue,
					(acc, newInputChip) => {
						if (
							!some(
								currentQuery,
								(currentQueryChip) => currentQueryChip.label === newInputChip.label
							)
						) {
							acc.push(newInputChip);
						}
						return acc;
					},
					filter(currentQuery, (currentQueryChip) =>
						some(
							searchInputValue,
							(searchInputChip) => searchInputChip.label === currentQueryChip.label
						)
					)
				);
			}

			setInputTyped('');

			return reduce(
				searchInputValue,
				(acc, searchInputChip) => {
					if (
						!some(
							currentQuery,
							(currentQueryChip) => currentQueryChip.label === searchInputChip.label
						)
					) {
						acc.push(searchInputChip);
					}
					return acc;
				},

				filter(currentQuery, (currentQueryChip: QueryChip) =>
					some(
						searchInputValue,
						(searchInputChip) => searchInputChip.label === currentQueryChip.label
					)
				)
			);
		});
		// TODO: perform a navigation only when coming from a different module (not the search one)
		history.push(`/${SEARCH_APP_ID}`);
	}, [updateQuery, history, inputTyped, searchInputValue]);

	const appSuggestions = useMemo<SearchOption[]>(
		() =>
			filter(storedSuggestions, (v) => v.app === currentSearchModuleRoute)
				.reverse()
				.map(
					(item): SearchOption => ({
						...item,
						disabled: searchDisabled,
						onClick: (): void => {
							const newInputChip: QueryChip = { ...item, hasAvatar: false, onClick: undefined };
							setSearchInputValue((prevState) => [...prevState, newInputChip]);
						}
					})
				),
		[storedSuggestions, currentSearchModuleRoute, searchDisabled]
	);

	const updateOptions = useCallback(
		(textContent: string, queryChips: QueryChip[]): void => {
			if (textContent.length > 0) {
				setOptions(
					appSuggestions
						.filter(
							(suggestion) =>
								textContent &&
								suggestion.label.includes(textContent) &&
								!some(queryChips, (queryChip) => queryChip.value === suggestion.label)
						)
						.slice(0, 5)
				);
			} else {
				setOptions(appSuggestions.slice(0, 5));
			}
		},
		[appSuggestions]
	);

	const onQueryChange = useCallback<NonNullable<ChipInputProps['onChange']>>(
		(newQuery) => {
			// FIXME: move the saving of suggestions after the search occurs.
			// 	The saving logic should not be placed here because the onChange is called even when a chip is removed from the chipInput.
			//  So, at the moment, keywords never searched for are saved too.
			const lastChipLabel = newQuery[newQuery.length - 1]?.label;
			if (
				lastChipLabel &&
				typeof lastChipLabel === 'string' &&
				currentSearchModuleRoute &&
				!find(appSuggestions, (suggestion) => suggestion.label === lastChipLabel)
			) {
				setStoredSuggestions((prevState) => {
					const newSuggestion: SearchOption = {
						value: lastChipLabel,
						label: lastChipLabel,
						icon: 'ClockOutline',
						app: currentSearchModuleRoute,
						id: lastChipLabel
					};
					return [...prevState, newSuggestion];
				});
			}

			// FIXME: remove the cast (by making ChipItem support generics?)
			setSearchInputValue(newQuery as QueryChip[]);
		},
		[appSuggestions, currentSearchModuleRoute, setStoredSuggestions]
	);

	const onInputType = useCallback<NonNullable<ChipInputProps['onInputType']>>(
		(ev) => {
			if (!ev.textContent) {
				setIsTyping(false);
			} else {
				setIsTyping(true);
			}
			setInputTyped(ev.textContent || '');
			updateOptions(ev.textContent || '', query);
		},
		[query, updateOptions]
	);

	useEffect(() => {
		if (currentSearchModuleRoute) {
			const suggestions = filter(
				appSuggestions,
				(suggestion) => suggestion.app === currentSearchModuleRoute
			).slice(0, 5);

			setOptions(suggestions);
		}
	}, [appSuggestions, currentSearchModuleRoute]);

	const containerRef = useRef<HTMLDivElement>(null);
	const addFocus = useCallback(() => setInputHasFocus(true), []);
	const removeFocus = useCallback(() => setInputHasFocus(false), []);

	useEffect(() => {
		const ref = inputRef.current;
		const runSearchOnKeyUp = (ev: KeyboardEvent): void => {
			if (ev.key === 'Enter') {
				onSearch();
				removeFocus();
			}
		};
		if (ref) {
			ref.addEventListener('keyup', runSearchOnKeyUp);
		}

		return (): void => {
			if (ref) {
				ref.removeEventListener('keyup', runSearchOnKeyUp);
			}
		};
	}, [onSearch, removeFocus]);

	const disableOptions = useMemo(() => options.length <= 0 || isTyping, [options, isTyping]);

	const placeholder = useMemo(
		() =>
			inputHasFocus && currentSearchModuleRoute
				? t('search.active_input_label', 'Separate your keywords by a comma or pressing TAB')
				: t('search.idle_input_label', 'Search in {{module}}', {
						module: moduleLabel
					}),
		[currentSearchModuleRoute, inputHasFocus, moduleLabel, t]
	);

	const clearButtonPlaceholder = useMemo(
		() =>
			showClear || isTyping
				? t('search.clear', 'Clear search input')
				: t('search.already_clear', 'Search input is already clear'),
		[showClear, t, isTyping]
	);

	const searchButtonsAreDisabled = useMemo(
		() => (isTyping ? false : !showClear),
		[showClear, isTyping]
	);

	const searchBtnTooltipLabel = useMemo(() => {
		if (!searchButtonsAreDisabled && searchInputValue.length > 0) {
			return t('search.start', 'Start search');
		}
		if (inputHasFocus) {
			return t(
				'search.type_or_choose_suggestion',
				'Type or choose some keywords to start a search'
			);
		}
		if (query.length > 0) {
			return t('label.edit_to_start_search', 'Edit your search to start a new one');
		}
		return t('search.type_to_start_search', 'Type some keywords to start a search');
	}, [searchButtonsAreDisabled, searchInputValue.length, inputHasFocus, query.length, t]);

	const onChipAdd = useCallback<NonNullable<ChipInputProps['onAdd']>>(
		(newChip) => {
			setIsTyping(false);
			setInputTyped('');
			if (currentSearchModuleRoute) {
				const suggestions = filter(
					appSuggestions,
					(suggestion) => suggestion?.app === currentSearchModuleRoute
				).slice(0, 5);

				setOptions(suggestions);
			}
			return {
				label: typeof newChip === 'string' ? newChip : '',
				value: newChip,
				hasAvatar: false
			};
		},
		[appSuggestions, currentSearchModuleRoute]
	);

	useEffect(() => {
		setSearchInputValue(map(query, (queryChip) => ({ ...queryChip, disabled: searchDisabled })));
	}, [searchDisabled, query]);

	const [raise, setRaise] = useState(false);

	useEffect(() => {
		if (RAISED_SEARCH_BAR) {
			setRaise(true);
		}
	}, [RAISED_SEARCH_BAR]);

	return (
		<div style={{ width: '100%', height: '100%' }}>
			<Desktop>
				<div
					style={{
						display: 'flex',
						width: '100%',
						height: '100%',
						flexDirection: 'column',
						justifyContent: 'center',
						alignItems: 'center'
					}}
				>
					<Grid2 container sx={{ maxWidth: '50vw', minWidth: '500px' }}>
						<Grid2 size={3}>
							<Card
								raised={raise ? true : false}
								sx={{
									width: '100%',
									height: '100%',
									borderBottomRightRadius: '0',
									bordertoprightRadius: '0',
									borderTopLeftRadius: '16px',
									borderBottomLeftRadius: '16px'
								}}
							>
								<ModuleSelector />
							</Card>
						</Grid2>
						<Grid2 size={6}>
							<Card
								raised={raise ? true : false}
								sx={{
									width: '100%',
									height: '100%',
									borderBottomLeftRadius: '0',
									borderTopLeftRadius: '0',
									backgroundColor: searchDisabled ? 'gray5' : 'gray6'
								}}
							>
								<StyledContainer orientation="horizontal">
									<StyledChipInput
										disabled={searchDisabled}
										inputRef={inputRef}
										value={searchInputValue}
										onAdd={onChipAdd}
										options={options}
										placeholder={placeholder}
										confirmChipOnBlur={false}
										separators={[
											{ key: 'Enter', ctrlKey: false },
											{ key: ',', ctrlKey: false },
											{ key: ' ', ctrlKey: false }
										]}
										onChange={onQueryChange}
										onInputType={onInputType}
										onInputTypeDebounce={0}
										onBlur={removeFocus}
										onFocus={addFocus}
										disableOptions={disableOptions}
										requireUniqueChips={false}
										wrap={'nowrap'}
									/>
								</StyledContainer>
							</Card>
						</Grid2>
						<Grid2 size={3}>
							<div
								style={{
									height: '100%',
									width: '100%',
									display: 'flex',
									flexDirection: 'row',
									marginLeft: '10px'
								}}
							>
								<div>
									{!searchButtonsAreDisabled && (
										<Card raised={raise ? true : false} sx={{ borderRadius: '8px' }}>
											<Tooltip label={clearButtonPlaceholder} placement="bottom">
												<OutlinedIconButton
													size="large"
													customSize={{
														iconSize: 'large',
														paddingSize: 'small'
													}}
													disabled={searchButtonsAreDisabled}
													icon="BackspaceOutline"
													iconColor={PRIMARY_ICON_COLOR_ACTIVE}
													onClick={clearSearch}
												/>
											</Tooltip>
										</Card>
									)}
								</div>
								<div>
									<Card
										raised={raise ? true : false}
										sx={{
											borderRadius: '8px',
											display: 'flex',
											flexDirection: 'column',
											alignItems: 'center',
											justifyContent: 'center',
											width: '48px',
											height: '48px',
											backgroundColor: FOREGROUND_COLOR,
											marginLeft: '10px'
										}}
									>
										<Tooltip
											maxWidth="100%"
											disabled={searchDisabled}
											label={searchBtnTooltipLabel}
											placement="bottom"
										>
											<IconButton
												size="large"
												customSize={{
													iconSize: 'large',
													paddingSize: 'small'
												}}
												icon="Search"
												disabled={searchButtonsAreDisabled}
												iconColor={
													searchButtonsAreDisabled
														? PRIMARY_ICON_COLOR_ACTIVE
														: PRIMARY_ICON_COLOR_INACTIVE
												}
												onClick={onSearch}
											/>
										</Tooltip>
									</Card>
								</div>
							</div>
						</Grid2>
					</Grid2>
				</div>
			</Desktop>
			<VeryLarge>
				<div
					style={{
						display: 'flex',
						width: '100%',
						height: '100%',
						flexDirection: 'column',
						justifyContent: 'center',
						alignItems: 'center'
					}}
				>
					<Grid2 container sx={{ maxWidth: '50vw', minWidth: '500px' }}>
						<Grid2 size={3}>
							<Card
								raised={raise ? true : false}
								sx={{
									width: '100%',
									height: '100%',
									borderBottomRightRadius: '0',
									bordertoprightRadius: '0',
									borderTopLeftRadius: '16px',
									borderBottomLeftRadius: '16px'
								}}
							>
								<ModuleSelector />
							</Card>
						</Grid2>
						<Grid2 size={6}>
							<Card
								raised={raise ? true : false}
								sx={{
									width: '100%',
									height: '100%',
									borderBottomLeftRadius: '0',
									borderTopLeftRadius: '0',
									backgroundColor: searchDisabled ? 'gray5' : 'gray6'
								}}
							>
								<StyledContainer orientation="horizontal">
									<StyledChipInput
										disabled={searchDisabled}
										inputRef={inputRef}
										value={searchInputValue}
										onAdd={onChipAdd}
										options={options}
										placeholder={placeholder}
										confirmChipOnBlur={false}
										separators={[
											{ key: 'Enter', ctrlKey: false },
											{ key: ',', ctrlKey: false },
											{ key: ' ', ctrlKey: false }
										]}
										onChange={onQueryChange}
										onInputType={onInputType}
										onInputTypeDebounce={0}
										onBlur={removeFocus}
										onFocus={addFocus}
										disableOptions={disableOptions}
										requireUniqueChips={false}
										wrap={'nowrap'}
									/>
								</StyledContainer>
							</Card>
						</Grid2>
						<Grid2 size={3}>
							<div
								style={{
									height: '100%',
									width: '100%',
									display: 'flex',
									flexDirection: 'row',
									marginLeft: '10px'
								}}
							>
								<div>
									{!searchButtonsAreDisabled && (
										<Card raised={raise ? true : false} sx={{ borderRadius: '8px' }}>
											<Tooltip label={clearButtonPlaceholder} placement="bottom">
												<OutlinedIconButton
													size="large"
													customSize={{
														iconSize: 'large',
														paddingSize: 'small'
													}}
													disabled={searchButtonsAreDisabled}
													icon="BackspaceOutline"
													iconColor={PRIMARY_ICON_COLOR_ACTIVE}
													onClick={clearSearch}
												/>
											</Tooltip>
										</Card>
									)}
								</div>
								<div>
									<Card
										raised={raise ? true : false}
										sx={{
											borderRadius: '8px',
											display: 'flex',
											flexDirection: 'column',
											alignItems: 'center',
											justifyContent: 'center',
											width: '48px',
											height: '48px',
											backgroundColor: FOREGROUND_COLOR,
											marginLeft: '10px'
										}}
									>
										<Tooltip
											maxWidth="100%"
											disabled={searchDisabled}
											label={searchBtnTooltipLabel}
											placement="bottom"
										>
											<IconButton
												size="large"
												customSize={{
													iconSize: 'large',
													paddingSize: 'small'
												}}
												icon="Search"
												disabled={searchButtonsAreDisabled}
												iconColor={
													searchButtonsAreDisabled
														? PRIMARY_ICON_COLOR_ACTIVE
														: PRIMARY_ICON_COLOR_INACTIVE
												}
												onClick={onSearch}
											/>
										</Tooltip>
									</Card>
								</div>
							</div>
						</Grid2>
					</Grid2>
				</div>
			</VeryLarge>
		</div>
	);
};
{
	/* <Container
			width="fit"
			flexGrow="1"
			orientation="horizontal"
			ref={containerRef}
			mainAlignment="flex-start"
			crossAlignment="flex-start"
		>
			<Tooltip
				disabled={!searchDisabled}
				maxWidth="100%"
				label={
					tooltip ??
					t('search.unable_to_parse_query', 'Unable to complete the search, clear it and retry')
				}
			>
				<Container orientation="horizontal" width="fill" maxWidth={'53vw'} minWidth={'32rem'}>
					<Container minWidth="20rem" width="fill">
						<Container orientation="horizontal" width="fill">
							<Container width="fit">
								<ModuleSelector />
							</Container>
							<StyledContainer orientation="horizontal">
								<StyledChipInput
									disabled={searchDisabled}
									inputRef={inputRef}
									value={searchInputValue}
									onAdd={onChipAdd}
									options={options}
									placeholder={placeholder}
									confirmChipOnBlur={false}
									separators={[
										{ key: 'Enter', ctrlKey: false },
										{ key: ',', ctrlKey: false },
										{ key: ' ', ctrlKey: false }
									]}
									background={searchDisabled ? 'gray5' : 'gray6'}
									onChange={onQueryChange}
									onInputType={onInputType}
									onInputTypeDebounce={0}
									onBlur={removeFocus}
									onFocus={addFocus}
									disableOptions={disableOptions}
									requireUniqueChips={false}
									wrap={'nowrap'}
								/>
							</StyledContainer>
						</Container>
					</Container>

					{!searchButtonsAreDisabled && (
						<Padding left="small">
							<Tooltip label={clearButtonPlaceholder} placement="bottom">
								<OutlinedIconButton
									size="large"
									customSize={{
										iconSize: 'large',
										paddingSize: 'small'
									}}
									disabled={searchButtonsAreDisabled}
									icon="BackspaceOutline"
									iconColor="primary"
									onClick={clearSearch}
								/>
							</Tooltip>
						</Padding>
					)}

					<Padding left="small">
						<Tooltip
							maxWidth="100%"
							disabled={searchDisabled}
							label={searchBtnTooltipLabel}
							placement="bottom"
						>
							<IconButton
								size="large"
								customSize={{
									iconSize: 'large',
									paddingSize: 'small'
								}}
								icon="Search"
								disabled={searchButtonsAreDisabled}
								backgroundColor="primary"
								iconColor="gray6"
								onClick={onSearch}
							/>
						</Tooltip>
					</Padding>
				</Container>
			</Tooltip>
		</Container> */
}

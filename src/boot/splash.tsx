/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { BACKGROUND_COLOR, PRIMARY_COLOR } from '../sruvi/EditedColors';
import { useEffect, useState } from 'react';
import './splash.css';
import React from 'react';
import indryve from '../../assets/indryve.png';
import Progressbar from '../sruvi/Progressbar';
import Desktop from '../sruvi/Desktop';
import Mobile from '../sruvi/Mobile';
import { Grid2, Typography } from '@mui/material';

export const LoadingView = (): React.JSX.Element => {
	return (
		<div
			style={{
				backgroundColor: BACKGROUND_COLOR,
				height: '100vh',
				width: '100vw',
				display: 'flex',
				flexDirection: 'column',
				justifyContent: 'center',
				alignItems: 'center'
			}}
		>
			<Desktop>
				<div
					style={{
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'center',
						minWidth: '250px',
						maxWidth: '350px'
					}}
				>
					<img src={indryve} style={{ width: '250px', height: 'auto' }} />

					<Typography variant="h6" style={{ marginBottom: '32px' }}>
						Accelerate Your <span style={{ color: PRIMARY_COLOR }}>Communication</span>
					</Typography>

					<Progressbar />
				</div>
			</Desktop>
			<Mobile>
				<div
					style={{
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'center',
						minWidth: '250px',
						maxWidth: '350px'
					}}
				>
					<img src={indryve} style={{ width: '250px', height: 'auto', marginBottom: '8px' }} />

					<Typography variant="h6" style={{ marginBottom: '32px' }}>
						Accelerate Your <span style={{ color: PRIMARY_COLOR }}>Communication</span>
					</Typography>

					<Progressbar />
				</div>
			</Mobile>
		</div>
	);
};

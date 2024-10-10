import { useMediaQuery } from 'react-responsive';
import React from 'react';

const Desktop = ({ children }: { children: JSX.Element | JSX.Element[] }): JSX.Element | null => {
	const isDesktop = useMediaQuery({ minWidth: 1025, minHeight: 720, maxWidth: 1919 });
	return isDesktop ? <>{children}</> : null;
};

export default Desktop;

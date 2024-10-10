import { useMediaQuery } from 'react-responsive';
import React from 'react';

const VeryLarge = ({ children }: { children: JSX.Element | JSX.Element[] }): JSX.Element | null => {
	const isVeryLarge = useMediaQuery({ minWidth: 1920, minHeight: 720 });
	return isVeryLarge ? <>{children}</> : null;
};

export default VeryLarge;

import React from 'react';
import { useMediaQuery } from 'react-responsive';

const Mobile = ({ children }: { children: JSX.Element | JSX.Element[] }): JSX.Element | null => {
	const isMobile = useMediaQuery({ maxWidth: 1024 });
	return isMobile ? <>{children}</> : null;
};

export default Mobile;

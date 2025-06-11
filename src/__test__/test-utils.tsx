import React, {type ReactElement} from 'react';
import {render, type RenderOptions} from '@testing-library/react';
import {I18nextProvider} from 'react-i18next';
import i18n from "./test-i18n-config";

const AllTheProviders = ({children}: { children: React.ReactNode }) => {
    return (
        <I18nextProvider i18n={i18n}>
            {children}
        </I18nextProvider>
    );
};

const customRender = (
    ui: ReactElement,
    options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, {wrapper: AllTheProviders, ...options});

// re-export everything
export * from '@testing-library/react';
export {customRender as render};
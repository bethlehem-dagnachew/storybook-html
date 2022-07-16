import React from 'react';
import { addons, types } from '@storybook/addons';
import { ADDON_ID, PANEL_ID, PARAM_KEY } from './constants';
import { VisionSimulator } from './components/VisionSimulator';
import { A11YPanel } from './components/A11YPanel';
import { A11yContextProvider } from './components/A11yContext';
addons.register(ADDON_ID, () => {
  addons.add(PANEL_ID, {
    title: '',
    type: types.TOOL,
    match: ({
      viewMode
    }) => viewMode === 'story',
    render: () => /*#__PURE__*/React.createElement(VisionSimulator, null)
  });
  addons.add(PANEL_ID, {
    title: 'Accessibility',
    type: types.PANEL,
    render: ({
      active = true,
      key
    }) => /*#__PURE__*/React.createElement(A11yContextProvider, {
      key: key,
      active: active
    }, /*#__PURE__*/React.createElement(A11YPanel, null)),
    paramKey: PARAM_KEY
  });
});
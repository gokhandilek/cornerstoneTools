import { state } from './../store/index.js';
import { BaseBrushSegmentationTool } from '../tools/base';
import onNewImageBrushEventHandler from '../eventListeners/onNewImageBrushEventHandler.js';
import external from './../externalModules.js';

const onNewImage = function(evt) {
  if (state.isToolLocked) {
    return false;
  }

  const element = evt.detail.element;

  const tools = state.tools.filter(
    tool =>
      tool.element === element &&
      (tool.mode === 'active' ||
        tool.mode === 'passive' ||
        tool.mode === 'enabled')
  );

  if (tools.length === 0) {
    return false;
  }

  tools.forEach(tool => {
    if (tool.newImageCallback) {
      tool.newImageCallback(evt);
    }
  });

  // Check if any brush tools are present.
  const brushTools = tools.filter(tool => tool instanceof BaseBrushSegmentationTool);

  if (brushTools.length > 0) {
    onNewImageBrushEventHandler(evt);
  }
};

const enable = function(element) {
  element.addEventListener(external.cornerstone.EVENTS.NEW_IMAGE, onNewImage);
};

const disable = function(element) {
  element.removeEventListener(
    external.cornerstone.EVENTS.NEW_IMAGE,
    onNewImage
  );
};

export default {
  enable,
  disable,
};

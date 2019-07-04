import BaseBrushSegmentationTool from './BaseBrushSegmentationTool.js';

describe('BaseBrushSegmentationTool.js', () => {
  describe('constructor()', function() {
    it('should have referencedToolData as brush', () => {
      const brushTool = new BaseBrushSegmentationTool();

      const configuration = brushTool.configuration;

      expect(configuration.referencedToolData).toEqual('brush');
    });
  });
});

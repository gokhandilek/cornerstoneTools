import ScissorsTool from './ScissorsTool';

jest.mock('./../../externalModules.js', () => ({
  cornerstone: {
    updateImage: () => {},
  },
}));

const mockEvt = {
  detail: {
    element: {},
    currentPoints: {
      image: {
        x: 1,
        y: 1,
      },
    },
  },
};

describe('ScissorsTool.js', () => {
  describe('Initialization', () => {
    it('Instantiate ScissorsTool Correctly', () => {
      const defaultName = 'Scissors';
      const instantiatedTool = new ScissorsTool();

      expect(instantiatedTool.name).toEqual(defaultName);
    });

    it('allows a custom name', () => {
      const customToolName = { name: 'CustomScissorsName' };
      const instantiatedTool = new ScissorsTool(customToolName);

      expect(instantiatedTool.name).toEqual(customToolName.name);
    });
  });

  describe('Events and Callbacks', () => {
    let instantiatedTool;

    beforeEach(() => {
      instantiatedTool = new ScissorsTool();
    });

    it('Calls right method on postMouseDownCallback ', () => {
      const _startOutliningRegion = jest.spyOn(
        instantiatedTool,
        '_startOutliningRegion'
      );

      instantiatedTool.postMouseDownCallback(mockEvt);

      setTimeout(() => {
        expect(_startOutliningRegion).toHaveBeenCalled();
      }, 2);
    });
  });
});

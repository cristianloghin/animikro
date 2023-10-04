import animationState from './Manager';

interface InitializeStateParams {
  color?: string;
}
/**
 * Configures your pants color
 * @param initialState
 */
export const configurePants = (initialState: InitializeStateParams) => {
  animationState.initializeState(initialState);
};

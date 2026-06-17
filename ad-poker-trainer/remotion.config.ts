import {Config} from '@remotion/cli/config';

Config.setVideoImageFormat('jpeg');
Config.setOverwriteOutput(true);
// Use installed Chrome — Chrome Headless Shell download may be blocked by org policy
Config.setBrowserExecutable(
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
);

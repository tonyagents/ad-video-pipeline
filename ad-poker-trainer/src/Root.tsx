import {Composition} from 'remotion';
import {Ad, AdProps, DEFAULT_PROPS, adSchema, totalDuration} from './Ad';
import {MascotAd, MASCOT_TOTAL} from './MascotAd';
import {DayAd, DAY_TOTAL} from './DayAd';
import {MoongateAd, MOONGATE_TOTAL} from './MoongateAd';
import worldcupProps from '../props/worldcup.json';
import skillProps from '../props/skill-creation.json';
import {FeatureTour, TOUR_DEFAULT, tourSchema, tourDuration, TourProps} from './FeatureTour';
import skillTourProps from '../props/skill-tour.json';
import x402TourProps from '../props/x402-tour.json';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="MoonAgentsAd"
        component={Ad}
        schema={adSchema}
        defaultProps={DEFAULT_PROPS}
        calculateMetadata={({props}) => ({
          durationInFrames: totalDuration(props),
        })}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="WorldCupAd"
        component={Ad}
        schema={adSchema}
        defaultProps={worldcupProps as AdProps}
        calculateMetadata={({props}) => ({
          durationInFrames: totalDuration(props),
        })}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="SkillCreationAd"
        component={Ad}
        schema={adSchema}
        defaultProps={skillProps as AdProps}
        calculateMetadata={({props}) => ({
          durationInFrames: totalDuration(props),
        })}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="FeatureTour"
        component={FeatureTour}
        schema={tourSchema}
        defaultProps={TOUR_DEFAULT}
        calculateMetadata={({props}) => ({
          durationInFrames: tourDuration(props),
        })}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="SkillTour"
        component={FeatureTour}
        schema={tourSchema}
        defaultProps={skillTourProps as TourProps}
        calculateMetadata={({props}) => ({
          durationInFrames: tourDuration(props),
        })}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="X402Tour"
        component={FeatureTour}
        schema={tourSchema}
        defaultProps={x402TourProps as TourProps}
        calculateMetadata={({props}) => ({
          durationInFrames: tourDuration(props),
        })}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="MascotAd"
        component={MascotAd}
        durationInFrames={MASCOT_TOTAL}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="DayAd"
        component={DayAd}
        durationInFrames={DAY_TOTAL}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="MoongateAd"
        component={MoongateAd}
        durationInFrames={MOONGATE_TOTAL}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};

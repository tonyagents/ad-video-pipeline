import {Composition} from 'remotion';
import {Ad, AdProps, DEFAULT_PROPS, adSchema, totalDuration} from './Ad';
import {MascotAd, MASCOT_TOTAL} from './MascotAd';
import {DayAd, DAY_TOTAL} from './DayAd';
import {ClankerAd, CLANKER_TOTAL} from './ClankerAd';
import {McpAd, MCP_TOTAL} from './McpAd';
import type {McpAdProps} from './McpAd';
import worldcupProps from '../props/worldcup.json';
import skillProps from '../props/skill-creation.json';
import {FeatureTour, TOUR_DEFAULT, tourSchema, tourDuration, TourProps} from './FeatureTour';
import skillTourProps from '../props/skill-tour.json';
import x402TourProps from '../props/x402-tour.json';
import basketsTourProps from '../props/baskets-tour.json';
import chainTourProps from '../props/chain-tour.json';
import {WalkthroughSpot, spotSchema, SpotProps} from './WalkthroughSpot';
import {AutomationsHeroFilm, AUTOMATIONS_HERO_TOTAL} from './AutomationsHeroFilm';
import {SignalNotNoiseFilm, SIGNAL_NOT_NOISE_TOTAL} from './SignalNotNoiseFilm';
import {SetTheRulesFilm, SET_THE_RULES_TOTAL} from './SetTheRulesFilm';
import {AutomationsHumanHeroFilm, AUTOMATIONS_HUMAN_HERO_TOTAL} from './AutomationsHumanHeroFilm';
import {AutomationsTemplatesDemoFilm, AUTOMATIONS_TEMPLATES_DEMO_TOTAL} from './AutomationsTemplatesDemoFilm';
import walkAutoProps from '../props/walk-auto.json';
import walkBrokerProps from '../props/walk-broker.json';
import walkVirtualProps from '../props/walk-virtual.json';
import walkResearchProps from '../props/walk-research.json';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="NovaAgentsAd"
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
        id="ClankerAd"
        component={ClankerAd}
        durationInFrames={CLANKER_TOTAL}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="McpAd"
        component={McpAd}
        durationInFrames={MCP_TOTAL}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="McpAdClaude"
        component={McpAd}
        defaultProps={{
          clientName: 'Claude',
          clientIcon: 'claude-icon.png',
          clientGlow: 'rgba(217,119,87,0.45)',
          recording: 'claude-buy.mp4',
          music: 'music-mcp.wav',
        } satisfies Partial<McpAdProps>}
        durationInFrames={MCP_TOTAL}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="McpAdGrok"
        component={McpAd}
        defaultProps={{
          clientName: 'Grok',
          clientIcon: 'grok-icon.png',
          clientGlow: 'rgba(255,255,255,0.20)',
          recording: 'grok-buy.mp4',
          music: 'music-mcp.wav',
        } satisfies Partial<McpAdProps>}
        durationInFrames={MCP_TOTAL}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="BasketsTour"
        component={FeatureTour}
        schema={tourSchema}
        defaultProps={basketsTourProps as TourProps}
        calculateMetadata={({props}) => ({
          durationInFrames: tourDuration(props),
        })}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="ChainTour"
        component={FeatureTour}
        schema={tourSchema}
        defaultProps={chainTourProps as TourProps}
        calculateMetadata={({props}) => ({
          durationInFrames: tourDuration(props),
        })}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="WalkAutomations"
        component={WalkthroughSpot}
        schema={spotSchema}
        defaultProps={walkAutoProps as SpotProps}
        calculateMetadata={({props}) => ({durationInFrames: props.durationInFrames})}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="WalkBroker"
        component={WalkthroughSpot}
        schema={spotSchema}
        defaultProps={walkBrokerProps as SpotProps}
        calculateMetadata={({props}) => ({durationInFrames: props.durationInFrames})}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="WalkVirtual"
        component={WalkthroughSpot}
        schema={spotSchema}
        defaultProps={walkVirtualProps as SpotProps}
        calculateMetadata={({props}) => ({durationInFrames: props.durationInFrames})}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="AutomationsHeroFilm"
        component={AutomationsHeroFilm}
        durationInFrames={AUTOMATIONS_HERO_TOTAL}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="SignalNotNoiseFilm"
        component={SignalNotNoiseFilm}
        durationInFrames={SIGNAL_NOT_NOISE_TOTAL}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="SetTheRulesFilm"
        component={SetTheRulesFilm}
        durationInFrames={SET_THE_RULES_TOTAL}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="AutomationsHumanHeroFilm"
        component={AutomationsHumanHeroFilm}
        durationInFrames={AUTOMATIONS_HUMAN_HERO_TOTAL}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="AutomationsTemplatesDemoFilm"
        component={AutomationsTemplatesDemoFilm}
        durationInFrames={AUTOMATIONS_TEMPLATES_DEMO_TOTAL}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="WalkResearch"
        component={WalkthroughSpot}
        schema={spotSchema}
        defaultProps={walkResearchProps as SpotProps}
        calculateMetadata={({props}) => ({durationInFrames: props.durationInFrames})}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};

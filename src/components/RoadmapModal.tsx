import { CosmicRoadmap, type CosmicRoadmapProps } from "./CosmicRoadmap";

export type RoadmapModalProps = CosmicRoadmapProps;

export function RoadmapModal(props: RoadmapModalProps) {
  return <CosmicRoadmap {...props} />;
}

import { useMemo, useState } from "react";
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import gameIndex from "./data/games/index.json";
import riskData from "./data/games/risk.json";
import clueData from "./data/games/clue.json";

type GameIndexEntry = {
  id: string;
  name: string;
  minPlayers: number;
  maxPlayers: number;
  supportsTeams: boolean;
  setupFlowId: string;
  turnFlowId: string;
};

type GameStep = {
  id: string;
  title?: string;
  text: string;
  ui: string;
};

type GamePhase = {
  id: string;
  title: string;
  steps: GameStep[];
};

type GameFlow = {
  title: string;
  steps?: GameStep[];
  phases?: GamePhase[];
};

type GameData = {
  id: string;
  name: string;
  minPlayers: number;
  maxPlayers: number;
  playerCounts: number[];
  setupFlows: Record<string, GameFlow>;
  turnFlows: Record<string, GameFlow>;
};

type Screen = "game" | "players" | "setup" | "turn";

type StepCompletion = Record<string, boolean>;

const gameDataById: Record<string, GameData> = {
  risk: riskData,
  clue: clueData,
};

export default function App() {
  const [screen, setScreen] = useState<Screen>("game");
  const [selectedGameId, setSelectedGameId] = useState<string | null>(null);
  const [playerCount, setPlayerCount] = useState<number | null>(null);
  const [setupCompletion, setSetupCompletion] = useState<StepCompletion>({});

  const selectedGameEntry = useMemo(() => {
    if (!selectedGameId) {
      return null;
    }
    return gameIndex.games.find((game) => game.id === selectedGameId) ?? null;
  }, [selectedGameId]);

  const selectedGame = selectedGameId ? gameDataById[selectedGameId] : null;

  const activeSetupFlow = useMemo(() => {
    if (!selectedGame || !selectedGameEntry) {
      return null;
    }
    return selectedGame.setupFlows[selectedGameEntry.setupFlowId] ?? null;
  }, [selectedGame, selectedGameEntry]);

  const activeTurnFlow = useMemo(() => {
    if (!selectedGame || !selectedGameEntry) {
      return null;
    }
    return selectedGame.turnFlows[selectedGameEntry.turnFlowId] ?? null;
  }, [selectedGame, selectedGameEntry]);

  const resetSelection = () => {
    setSelectedGameId(null);
    setPlayerCount(null);
    setSetupCompletion({});
    setScreen("game");
  };

  const handleGameSelect = (gameId: string) => {
    setSelectedGameId(gameId);
    setPlayerCount(null);
    setSetupCompletion({});
    setScreen("players");
  };

  const handlePlayerSelect = (count: number) => {
    setPlayerCount(count);
    setScreen("setup");
  };

  const toggleSetupStep = (stepId: string) => {
    setSetupCompletion((prev) => ({
      ...prev,
      [stepId]: !prev[stepId],
    }));
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Header
          selectedGame={selectedGame}
          playerCount={playerCount}
          onReset={resetSelection}
        />
        {screen === "game" && (
          <GamePicker games={gameIndex.games} onSelect={handleGameSelect} />
        )}
        {screen === "players" && selectedGame && (
          <PlayerPicker
            game={selectedGame}
            onSelect={handlePlayerSelect}
            onBack={() => setScreen("game")}
          />
        )}
        {screen === "setup" && selectedGame && activeSetupFlow && (
          <SetupGuide
            game={selectedGame}
            flow={activeSetupFlow}
            completion={setupCompletion}
            onToggle={toggleSetupStep}
            onBack={() => setScreen("players")}
            onNext={() => setScreen("turn")}
          />
        )}
        {screen === "turn" && selectedGame && activeTurnFlow && (
          <TurnGuide
            flow={activeTurnFlow}
            onBack={() => setScreen("setup")}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

type HeaderProps = {
  selectedGame: GameData | null;
  playerCount: number | null;
  onReset: () => void;
};

function Header({ selectedGame, playerCount, onReset }: HeaderProps) {
  return (
    <View style={styles.header}>
      <View>
        <Text style={styles.title}>Boardgame Guide</Text>
        <Text style={styles.subtitle}>
          {selectedGame
            ? `${selectedGame.name} · ${playerCount ?? "Select players"}`
            : "Select a game to begin"}
        </Text>
      </View>
      <Pressable style={styles.resetButton} onPress={onReset}>
        <Text style={styles.resetText}>Reset</Text>
      </Pressable>
    </View>
  );
}

type GamePickerProps = {
  games: GameIndexEntry[];
  onSelect: (gameId: string) => void;
};

function GamePicker({ games, onSelect }: GamePickerProps) {
  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <Text style={styles.sectionTitle}>Choose a game</Text>
      {games.map((game) => (
        <Pressable
          key={game.id}
          style={styles.card}
          onPress={() => onSelect(game.id)}
        >
          <Text style={styles.cardTitle}>{game.name}</Text>
          <Text style={styles.cardSubtitle}>
            {game.minPlayers}-{game.maxPlayers} players
          </Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

type PlayerPickerProps = {
  game: GameData;
  onSelect: (count: number) => void;
  onBack: () => void;
};

function PlayerPicker({ game, onSelect, onBack }: PlayerPickerProps) {
  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <Text style={styles.sectionTitle}>Select number of players</Text>
      <View style={styles.pillRow}>
        {game.playerCounts.map((count) => (
          <Pressable
            key={count}
            style={styles.pill}
            onPress={() => onSelect(count)}
          >
            <Text style={styles.pillText}>{count} players</Text>
          </Pressable>
        ))}
      </View>
      <Pressable style={styles.secondaryButton} onPress={onBack}>
        <Text style={styles.secondaryButtonText}>Back to games</Text>
      </Pressable>
    </ScrollView>
  );
}

type SetupGuideProps = {
  game: GameData;
  flow: GameFlow;
  completion: StepCompletion;
  onToggle: (stepId: string) => void;
  onBack: () => void;
  onNext: () => void;
};

function SetupGuide({
  game,
  flow,
  completion,
  onToggle,
  onBack,
  onNext,
}: SetupGuideProps) {
  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <Text style={styles.sectionTitle}>{game.name} setup</Text>
      <Text style={styles.sectionSubtitle}>{flow.title}</Text>
      {flow.steps?.map((step, index) => (
        <Pressable
          key={step.id}
          style={styles.stepCard}
          onPress={() => onToggle(step.id)}
        >
          <View style={styles.stepHeader}>
            <Text style={styles.stepIndex}>{index + 1}</Text>
            <Text style={styles.stepTitle}>{step.title ?? "Step"}</Text>
            <Text style={styles.stepStatus}>
              {completion[step.id] ? "Done" : "Tap to mark"}
            </Text>
          </View>
          <Text style={styles.stepText}>{step.text}</Text>
        </Pressable>
      ))}
      <View style={styles.buttonRow}>
        <Pressable style={styles.secondaryButton} onPress={onBack}>
          <Text style={styles.secondaryButtonText}>Back</Text>
        </Pressable>
        <Pressable style={styles.primaryButton} onPress={onNext}>
          <Text style={styles.primaryButtonText}>Start turn guide</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

type TurnGuideProps = {
  flow: GameFlow;
  onBack: () => void;
};

function TurnGuide({ flow, onBack }: TurnGuideProps) {
  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <Text style={styles.sectionTitle}>Turn guide</Text>
      <Text style={styles.sectionSubtitle}>{flow.title}</Text>
      {flow.phases?.map((phase, index) => (
        <View key={phase.id} style={styles.phaseCard}>
          <View style={styles.phaseHeader}>
            <Text style={styles.phaseIndex}>{index + 1}</Text>
            <Text style={styles.phaseTitle}>{phase.title}</Text>
          </View>
          {phase.steps.map((step) => (
            <View key={step.id} style={styles.phaseStep}>
              <Text style={styles.phaseStepTitle}>{step.title ?? "Step"}</Text>
              <Text style={styles.phaseStepText}>{step.text}</Text>
            </View>
          ))}
        </View>
      ))}
      <Pressable style={styles.secondaryButton} onPress={onBack}>
        <Text style={styles.secondaryButtonText}>Back to setup</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#0f172a",
  },
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
  },
  header: {
    padding: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#1e293b",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#f8fafc",
  },
  subtitle: {
    marginTop: 4,
    color: "#94a3b8",
  },
  resetButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#334155",
  },
  resetText: {
    color: "#e2e8f0",
    fontWeight: "600",
  },
  scrollContent: {
    padding: 16,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#f8fafc",
  },
  sectionSubtitle: {
    color: "#cbd5f5",
    marginBottom: 8,
  },
  card: {
    backgroundColor: "#111827",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#1f2937",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#f8fafc",
  },
  cardSubtitle: {
    marginTop: 6,
    color: "#94a3b8",
  },
  pillRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  pill: {
    backgroundColor: "#1d4ed8",
    borderRadius: 999,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  pillText: {
    color: "#eff6ff",
    fontWeight: "600",
  },
  stepCard: {
    backgroundColor: "#111827",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#1f2937",
    gap: 10,
  },
  stepHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
  },
  stepIndex: {
    width: 28,
    height: 28,
    borderRadius: 999,
    backgroundColor: "#334155",
    color: "#f8fafc",
    textAlign: "center",
    textAlignVertical: "center",
    fontWeight: "700",
  },
  stepTitle: {
    flex: 1,
    color: "#f8fafc",
    fontWeight: "600",
  },
  stepStatus: {
    color: "#94a3b8",
    fontSize: 12,
  },
  stepText: {
    color: "#cbd5f5",
    lineHeight: 20,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: "#22c55e",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#052e16",
    fontWeight: "700",
  },
  secondaryButton: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#334155",
  },
  secondaryButtonText: {
    color: "#e2e8f0",
    fontWeight: "600",
  },
  phaseCard: {
    backgroundColor: "#0b1220",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#1f2937",
    gap: 12,
  },
  phaseHeader: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },
  phaseIndex: {
    width: 32,
    height: 32,
    borderRadius: 999,
    backgroundColor: "#1e40af",
    color: "#dbeafe",
    textAlign: "center",
    textAlignVertical: "center",
    fontWeight: "700",
  },
  phaseTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#f8fafc",
  },
  phaseStep: {
    paddingLeft: 8,
    borderLeftWidth: 2,
    borderLeftColor: "#1e293b",
    gap: 4,
  },
  phaseStepTitle: {
    color: "#e2e8f0",
    fontWeight: "600",
  },
  phaseStepText: {
    color: "#94a3b8",
  },
});

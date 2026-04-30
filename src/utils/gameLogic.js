export function generateGame() {
  const modulesPool = ["wires", "button", "signal"];

  const shuffled = modulesPool.sort(() => 0.5 - Math.random());

  return {
    modules: shuffled.slice(0, 3),
    serial: Math.floor(Math.random() * 9999),
    fuelCells: Math.floor(Math.random() * 3) + 1,
    indicators: ["NAV", "ENG"].filter(() => Math.random() > 0.5),
    missionCode: "ORBIT"
  };
}
import { access } from "node:fs/promises";
import { constants } from "node:fs";
import { formatImportSummary, importInventoryFile } from "@/lib/inventory/importer";

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const helpRequested = args.includes("--help") || args.includes("-h");
  const filePath = getFlagValue(args, "--file") ?? args.find((arg) => !arg.startsWith("-"));

  if (helpRequested || !filePath) {
    printHelp();
    process.exit(helpRequested ? 0 : 1);
  }

  await access(filePath, constants.R_OK);

  const summary = await importInventoryFile({ filePath, dryRun });

  process.stdout.write(`${formatImportSummary(summary)}\n`);

  if (summary.categoryPreview.length > 0) {
    process.stdout.write(`Categorías nuevas detectadas: ${summary.categoryPreview.join(", ")}\n`);
  }

  if (dryRun) {
    process.stdout.write("Dry-run completado. No se escribieron cambios en la base.\n");
  } else {
    process.stdout.write("Importación completada.\n");
  }
}

function getFlagValue(args: string[], flag: string) {
  const index = args.indexOf(flag);
  if (index === -1) return undefined;
  return args[index + 1];
}

function printHelp() {
  process.stdout.write([
    "Uso:",
    "  pnpm inventory:import --file \"/ruta/al/InventariomV.xls\"",
    "  pnpm inventory:import --file \"/ruta/al/InventariomV.xls\" --dry-run",
    "",
    "Flags:",
    "  --file     Ruta al export tabulado del sistema del local",
    "  --dry-run  Procesa y resume sin escribir en la base",
  ].join("\n"));
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : "Error desconocido";
  console.error(`Importación falló: ${message}`);
  process.exit(1);
});

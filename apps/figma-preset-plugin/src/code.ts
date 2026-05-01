import { generateVariablePayload } from "./preset-theme"
import { uiHtml } from "./ui-html"

type GenerateVariablesMessage = {
  type: "generate-variables"
  presetCode: string
  collectionName?: string
}

async function getOrCreateCollection(name: string) {
  const collections = await figma.variables.getLocalVariableCollectionsAsync()

  return (
    collections.find((collection) => collection.name === name) ??
    figma.variables.createVariableCollection(name)
  )
}

function ensureModes(collection: VariableCollection) {
  const lightMode = collection.modes[0]

  if (lightMode.name !== "Light") {
    collection.renameMode(lightMode.modeId, "Light")
  }

  const existingDarkMode = collection.modes.find((mode) => mode.name === "Dark")
  const darkModeId = existingDarkMode?.modeId ?? collection.addMode("Dark")

  return {
    lightModeId: lightMode.modeId,
    darkModeId,
  }
}

function getOrCreateVariable(
  collection: VariableCollection,
  name: string,
  resolvedType: VariableResolvedDataType,
  variables: Variable[]
) {
  return (
    variables.find(
      (variable) =>
        variable.variableCollectionId === collection.id && variable.name === name
    ) ?? figma.variables.createVariable(name, collection, resolvedType)
  )
}

async function createOrUpdateVariables(
  collection: VariableCollection,
  payload: ReturnType<typeof generateVariablePayload>
) {
  const { lightModeId, darkModeId } = ensureModes(collection)
  const [colorVariables, stringVariables, numberVariables] = await Promise.all([
    figma.variables.getLocalVariablesAsync("COLOR"),
    figma.variables.getLocalVariablesAsync("STRING"),
    figma.variables.getLocalVariablesAsync("FLOAT"),
  ])

  for (const colorVariable of payload.colors) {
    const variable = getOrCreateVariable(
      collection,
      colorVariable.name,
      "COLOR",
      colorVariables
    )
    variable.setValueForMode(lightModeId, colorVariable.light)
    variable.setValueForMode(darkModeId, colorVariable.dark)
  }

  for (const stringVariable of payload.strings) {
    const variable = getOrCreateVariable(
      collection,
      stringVariable.name,
      "STRING",
      stringVariables
    )
    variable.setValueForMode(lightModeId, stringVariable.value)
    variable.setValueForMode(darkModeId, stringVariable.value)
  }

  for (const numberVariable of payload.numbers) {
    const variable = getOrCreateVariable(
      collection,
      numberVariable.name,
      "FLOAT",
      numberVariables
    )
    variable.setValueForMode(lightModeId, numberVariable.value)
    variable.setValueForMode(darkModeId, numberVariable.value)
  }

  return payload.colors.length + payload.strings.length + payload.numbers.length
}

figma.showUI(uiHtml, {
  width: 420,
  height: 430,
  themeColors: true,
})

figma.ui.onmessage = async (message: GenerateVariablesMessage) => {
  if (message.type !== "generate-variables") {
    return
  }

  try {
    const payload = generateVariablePayload(
      message.presetCode,
      message.collectionName
    )
    const collection = await getOrCreateCollection(payload.collectionName)
    const variableCount = await createOrUpdateVariables(collection, payload)

    figma.notify(`Updated ${variableCount} variables in ${payload.collectionName}.`)
    figma.ui.postMessage({
      type: "generate-success",
      collectionName: payload.collectionName,
      presetCode: payload.presetCode,
      summary: payload.summary,
      variableCount,
    })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not generate variables."

    figma.ui.postMessage({
      type: "generate-error",
      error: message,
    })
  }
}

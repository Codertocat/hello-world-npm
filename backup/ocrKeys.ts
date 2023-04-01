export default async function ocrKeys(value: string): Promise<void> {
    const actions: { type: string; value: string }[] = [];
    [...value].forEach((char: string) => {
      actions.push({ type: 'keyDown', value: char })
      actions.push({ type: 'keyUp', value: char })
    })
  
    await driver.performActions([
      {
        type: 'key',
        id: 'keyboard',
        actions,
      },
    ])
  }
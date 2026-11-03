import { expect, test, type Page } from '@playwright/test';

function watchClientRegressions(page: Page) {
  const runtimeErrors: string[] = [];
  const renderWarnings: string[] = [];

  page.on('pageerror', (error) => runtimeErrors.push(error.message));
  page.on('console', (message) => {
    if (
      message.type() === 'error' &&
      /hydration|each child in a list|unique.*key|same key/i.test(message.text())
    ) {
      renderWarnings.push(message.text());
    }
  });

  return () => {
    expect(runtimeErrors).toEqual([]);
    expect(renderWarnings).toEqual([]);
  };
}

async function signInAsAdmin(page: Page) {
  const email = process.env.E2E_ADMIN_EMAIL;
  const password = process.env.E2E_ADMIN_PASSWORD;
  if (!email || !password) throw new Error('Missing isolated E2E admin credentials.');

  await page.goto('/auth/signin');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Contraseña').fill(password);
  await page.getByRole('main').getByRole('button', { name: 'Ingresar' }).click();
  await page
    .getByRole('complementary')
    .getByRole('link', { name: 'Dashboard' })
    .waitFor({ state: 'visible' });
}

test('visitor can interact with home ranking, filters, and public sidebar pages', async ({
  page,
}) => {
  const assertNoRenderRegressions = watchClientRegressions(page);
  await page.goto('/');

  await expect(page.getByRole('heading', { name: 'Los mejores del circuito' })).toBeVisible();
  const homeLevels = page.getByRole('tablist', { name: 'Nivel' });
  await homeLevels.getByRole('tab', { name: 'B', exact: true }).click();
  await expect(homeLevels.getByRole('tab', { name: 'B', exact: true })).toHaveAttribute(
    'aria-selected',
    'true',
  );
  const carousel = page.getByRole('tablist', { name: 'Categoría' });
  await carousel.getByRole('tab', { name: 'Mujeres' }).click();
  await expect(carousel.getByRole('tab', { name: 'Mujeres' })).toHaveAttribute(
    'aria-selected',
    'true',
  );
  await page
    .getByRole('tablist', { name: 'Período' })
    .getByRole('tab', { name: 'Año calendario' })
    .click();
  await expect(
    page.getByRole('tablist', { name: 'Período' }).getByRole('tab', { name: 'Año calendario' }),
  ).toHaveAttribute('aria-selected', 'true');

  const sidebar = page.getByRole('complementary');
  await sidebar.getByRole('link', { name: 'Ranking' }).click();
  await expect(page).toHaveURL(/\/leaderboard$/);
  const levels = page.getByRole('tablist', { name: 'Nivel' });
  await levels.getByRole('tab', { name: 'Sin nivel' }).click();
  await expect(levels.getByRole('tab', { name: 'Sin nivel' })).toHaveAttribute(
    'aria-selected',
    'true',
  );
  await page
    .getByRole('tablist', { name: 'Categoría' })
    .getByRole('tab', { name: 'Mujeres' })
    .click();
  await expect(page.locator('.lb-content')).toContainText('Woman Player');

  await sidebar.getByRole('link', { name: 'Reglas y puntuación' }).click();
  await expect(page).toHaveURL(/\/information$/);
  await expect(page.getByRole('heading', { name: /Reglas|Puntuación/i }).first()).toBeVisible();
  assertNoRenderRegressions();
});

test('finished women tournament shows the champion label and a tiebreak score', async ({
  page,
}) => {
  const assertNoRenderRegressions = watchClientRegressions(page);
  await signInAsAdmin(page);
  await page.goto('/tournaments/it-tournament-none');

  await expect(page.getByRole('heading', { name: 'Unlevelled Finished' })).toBeVisible();
  await expect(page.locator('.tournament-champion')).toContainText('Campeona');
  await expect(page.locator('.tournament-champion')).toContainText('Woman Player');
  await page.getByRole('tab', { name: 'Partidos' }).click();
  await expect(page.getByText('7(7)-6(4)', { exact: true })).toBeVisible();
  assertNoRenderRegressions();
});

test('admin creates, starts, scores, and finishes a playoff tournament from the UI', async ({
  page,
}) => {
  test.setTimeout(90_000);
  const assertNoRenderRegressions = watchClientRegressions(page);

  const tournamentName = 'E2E Playoffs';
  await signInAsAdmin(page);
  await page.getByRole('complementary').getByRole('link', { name: 'Dashboard' }).click();
  await expect(page.getByRole('heading', { name: 'Torneos', exact: true })).toBeVisible();

  await page.getByRole('button', { name: '+ Nuevo Torneo' }).click();
  const createDialog = page.getByRole('dialog', { name: 'Nuevo Torneo' });
  await createDialog.getByLabel('Nombre').fill(tournamentName);
  await createDialog.getByLabel('Sede').selectOption({ label: 'Integration Court' });
  await createDialog.getByLabel('Superficie').selectOption({ label: 'Integration Surface' });
  await createDialog.getByLabel('Categoría').selectOption({ label: 'Integration Category' });
  await createDialog.getByRole('button', { name: 'Seleccionar formato...' }).click();
  const typeDialog = page.getByRole('dialog', { name: 'Elegí el tipo de torneo' });
  await typeDialog.getByRole('heading', { name: 'Playoffs', exact: true }).click();
  await createDialog.getByLabel(/Tamaño del cuadro/).fill('3');

  const createResponse = page.waitForResponse(
    (response) =>
      response.url().endsWith('/api/admin/tournaments') &&
      response.request().method() === 'POST' &&
      response.status() === 201,
  );
  await createDialog.getByRole('button', { name: 'Crear registro' }).click();
  const createdTournament = await (await createResponse).json();
  const tournamentId = createdTournament.data.id as string;
  expect(tournamentId).toBeTruthy();

  const tournamentRow = page.locator('.record-row').filter({ hasText: tournamentName });
  await expect(tournamentRow).toContainText('En preparación');
  await tournamentRow.getByRole('button', { name: 'Editar' }).click();
  let setupDialog = page.getByRole('dialog', { name: /Configurar/ });

  for (const playerName of ['E2E Player One', 'E2E Player Two', 'E2E Player Three']) {
    await setupDialog.locator('.prep-available-item').filter({ hasText: playerName }).click();
  }
  await expect(setupDialog.locator('.prep-slots-badge')).toContainText('3 / 3 cupos');
  await setupDialog.getByRole('button', { name: 'Guardar borrador' }).click();
  await expect(setupDialog).toBeHidden();

  await page.locator('.record-row').filter({ hasText: tournamentName }).getByRole('button', { name: 'Editar' }).click();
  setupDialog = page.getByRole('dialog', { name: /Configurar/ });
  const drawPanel = setupDialog.getByRole('region', { name: 'Sorteo del cuadro' });
  await expect(drawPanel.getByTestId('draw-status')).toHaveText('Sin sortear');
  await expect(setupDialog.getByRole('button', { name: /Iniciar torneo/ })).toBeDisabled();

  await drawPanel.getByLabel('Modo de siembra').selectOption({ label: 'Manual' });
  await drawPanel.getByRole('button', { name: 'E2E Player One' }).click();
  await drawPanel.getByRole('button', { name: 'Generar sorteo' }).click();
  await expect(drawPanel.getByTestId('draw-status')).toHaveText('Borrador');
  await expect(drawPanel).toContainText('BYE');

  await setupDialog.getByRole('button', { name: /Iniciar torneo/ }).click();
  await expect(setupDialog).toBeHidden();
  await expect(page.getByRole('status')).toContainText('Torneo iniciado');

  await page.locator('.record-row').filter({ hasText: tournamentName }).getByRole('button', { name: 'Resultados' }).click();
  const resultsDialog = page.getByRole('dialog', { name: tournamentName });

  // Clicks the first unplayed match card; player 1 of the card wins. Returns the winner's name.
  async function playFirstPending(options: { tiebreak?: [string, string]; walkover?: boolean } = {}) {
    const card = resultsDialog.locator('.draw-match-card.is-clickable:not(.is-played)').first();
    await expect(card).toBeVisible();
    const label = (await card.locator('.draw-slot-label').first().textContent()) ?? '';
    const winner = label.replace(/^\(\d+\)\s*/, '').trim();
    await card.click();
    const resultDialog = page.getByRole('dialog', { name: 'Resultado del partido' });
    await expect(resultDialog).toBeVisible();
    if (options.walkover) {
      await resultDialog.getByLabel(/W\.O\./).first().check();
      await resultDialog.getByLabel('Ganador por W.O.').selectOption({ index: 1 });
    } else {
      const { tiebreak } = options;
      await resultDialog.getByLabel('Games jugador 1 - set 1').fill(tiebreak ? '7' : '6');
      await resultDialog.getByLabel('Games jugador 2 - set 1').fill(tiebreak ? '6' : '4');
      if (tiebreak) {
        await resultDialog.getByLabel('Tie-break', { exact: true }).check();
        await resultDialog.getByLabel('Tie-break jugador 1 - set 1').fill(tiebreak[0]);
        await resultDialog.getByLabel('Tie-break jugador 2 - set 1').fill(tiebreak[1]);
      }
    }
    const matchResponse = page.waitForResponse(
      (response) =>
        response.url().endsWith('/api/add-match') &&
        response.request().method() === 'POST' &&
        response.status() === 201,
    );
    await resultDialog.getByRole('button', { name: options.walkover ? 'Registrar W.O.' : 'Guardar resultado' }).click();
    await matchResponse;
    await expect(resultDialog).toBeHidden();
    return winner;
  }

  await playFirstPending({ walkover: true });
  await expect(resultsDialog.locator('.draw-wo-pill')).toHaveCount(1);
  const champion = await playFirstPending({ tiebreak: ['7', '5'] });

  await resultsDialog.getByRole('button', { name: /Cerrar torneo/ }).click();
  await page.getByRole('alertdialog', { name: '¿Finalizar torneo?' }).getByRole('button', { name: 'Finalizar torneo' }).click();
  await expect(resultsDialog).toBeHidden();
  await expect(page.locator('.record-row').filter({ hasText: tournamentName })).toContainText('Terminado');

  await page.goto(`/tournaments/${tournamentId}`);
  await expect(page.getByRole('heading', { name: tournamentName })).toBeVisible();
  await expect(page.locator('.tournament-champion')).toContainText('Campeón');
  await expect(page.locator('.tournament-champion')).toContainText(champion);
  await page.getByRole('tab', { name: 'Partidos' }).click();
  await expect(page.getByText('7(7)-6(5)', { exact: true })).toBeVisible();
  await page.getByRole('tab', { name: 'Cuadro' }).click();
  await expect(page.getByRole('heading', { name: 'Semifinal' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Final', exact: true })).toBeVisible();
  assertNoRenderRegressions();
});

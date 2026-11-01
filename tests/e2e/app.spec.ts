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
  const setupDialog = page.getByRole('dialog', { name: /Configurar/ });

  for (const playerName of ['E2E Player One', 'E2E Player Two', 'E2E Player Three']) {
    await setupDialog.locator('.prep-available-item').filter({ hasText: playerName }).click();
    await expect(
      setupDialog.locator('.tournament-draw-preview').getByText(playerName, { exact: true }),
    ).toBeVisible();
  }
  const preview = setupDialog.getByRole('region', { name: 'Vista previa del cuadro' });
  await expect(preview).toContainText('BYE');
  const finalRound = preview.locator('.bracket-round').nth(1);
  await expect(
    finalRound.locator('.bracket-player').filter({ hasText: 'E2E Player One' }),
  ).toBeVisible();
  await expect(finalRound).toContainText('Pase directo por BYE · sin puntos por victoria');
  await expect(setupDialog.locator('.prep-slots-badge')).toContainText('3 / 3 cupos');
  await setupDialog.getByRole('button', { name: /Iniciar torneo/ }).click();
  await expect(setupDialog).toBeHidden();
  await expect(page.getByRole('status')).toContainText('Torneo iniciado');

  const adminNavigation = page.getByRole('navigation', { name: 'Secciones administrativas' });
  await adminNavigation.getByRole('button', { name: /Partidos/ }).click();

  async function createPlayoffMatch({
    playerOne,
    playerTwo,
    stage,
    gamesOne,
    gamesTwo,
    tiebreakOne,
    tiebreakTwo,
  }: {
    playerOne: string;
    playerTwo: string;
    stage: 'Semifinal' | 'Final';
    gamesOne: string;
    gamesTwo: string;
    tiebreakOne?: string;
    tiebreakTwo?: string;
  }) {
    await page.getByRole('button', { name: '+ Nuevo Partido' }).click();
    const matchDialog = page.getByRole('dialog', { name: 'Nuevo Partido' });
    await matchDialog.getByLabel('Torneo').selectOption({ label: tournamentName });
    await matchDialog
      .locator('label.field')
      .filter({ hasText: 'Jugador 1' })
      .locator('select')
      .selectOption({ label: playerOne });
    await matchDialog
      .locator('label.field')
      .filter({ hasText: 'Jugador 2' })
      .locator('select')
      .selectOption({ label: playerTwo });
    await matchDialog.getByLabel('Fase').selectOption({ label: stage });
    await matchDialog.getByLabel('Games jugador 1 - set 1').fill(gamesOne);
    await matchDialog.getByLabel('Games jugador 2 - set 1').fill(gamesTwo);

    if (tiebreakOne !== undefined && tiebreakTwo !== undefined) {
      await matchDialog.getByLabel('Tiebreak').check();
      await matchDialog.getByLabel('Puntos tiebreak jugador 1 - set 1').fill(tiebreakOne);
      await matchDialog.getByLabel('Puntos tiebreak jugador 2 - set 1').fill(tiebreakTwo);
    }

    const matchResponse = page.waitForResponse(
      (response) =>
        response.url().endsWith('/api/add-match') &&
        response.request().method() === 'POST' &&
        response.status() === 201,
    );
    await matchDialog.getByLabel('Fecha del partido').fill('2026-03-15');
    await matchDialog.getByRole('button', { name: 'Crear registro' }).click();
    const created = await (await matchResponse).json();
    expect(String(created.playedAt)).toContain('2026-03-15');
    await expect(matchDialog).toBeHidden();
    await expect(page.getByRole('status')).toContainText('Partido creado correctamente');
  }

  await createPlayoffMatch({
    playerOne: 'E2E Player Two',
    playerTwo: 'E2E Player Three',
    stage: 'Semifinal',
    gamesOne: '6',
    gamesTwo: '4',
  });
  await createPlayoffMatch({
    playerOne: 'E2E Player Three',
    playerTwo: 'E2E Player One',
    stage: 'Final',
    gamesOne: '7',
    gamesTwo: '6',
    tiebreakOne: '7',
    tiebreakTwo: '5',
  });

  await adminNavigation.getByRole('button', { name: /Torneos/ }).click();
  const inProgressRow = page.locator('.record-row').filter({ hasText: tournamentName });
  await expect(inProgressRow).toContainText('En curso');
  await inProgressRow.getByRole('button', { name: 'Editar' }).click();
  const finishDialog = page.getByRole('dialog', { name: 'Editar Torneo' });
  await finishDialog.getByLabel('Campeón').selectOption({ label: 'E2E Player Three' });
  await finishDialog.getByRole('button', { name: 'Guardar cambios' }).click();
  await expect(finishDialog).toBeHidden();
  await expect(page.locator('.record-row').filter({ hasText: tournamentName })).toContainText(
    'Terminado',
  );

  await page.goto(`/tournaments/${tournamentId}`);
  await expect(page.getByRole('heading', { name: tournamentName })).toBeVisible();
  await expect(page.locator('.tournament-champion')).toContainText('Campeón');
  await expect(page.locator('.tournament-champion')).toContainText('E2E Player Three');
  await page.getByRole('tab', { name: 'Partidos' }).click();
  await expect(page.getByText('7(7)-6(5)', { exact: true })).toBeVisible();
  await page.getByRole('tab', { name: 'Cuadro' }).click();
  await expect(page.getByText('Semifinal', { exact: true })).toBeVisible();
  await expect(page.getByText('Final', { exact: true })).toBeVisible();
  await expect(page.locator('.bracket-round').getByText('E2E Player Three').first()).toBeVisible();
  assertNoRenderRegressions();
});

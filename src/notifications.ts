import { getSetting } from './db';

const REMINDER_ID = 1;

/** Programa (o cancela) el recordatorio diario según los ajustes guardados.
 * Es idempotente: siempre cancela la notificación previa antes de reprogramar,
 * así que se puede llamar cuantas veces haga falta sin duplicar avisos.
 * Llamar al iniciar la app y cada vez que cambian los ajustes del recordatorio
 * (no en cada navegación entre pestañas). */
export async function scheduleReminder(): Promise<void> {
  const enabled = await getSetting('reminderEnabled');
  const time = await getSetting('reminderTime');

  try {
    const { LocalNotifications } = await import('@capacitor/local-notifications');
    await LocalNotifications.cancel({ notifications: [{ id: REMINDER_ID }] });

    if (enabled !== '1' || !time) return;

    const perm = await LocalNotifications.checkPermissions();
    if (perm.display !== 'granted') {
      const req = await LocalNotifications.requestPermissions();
      if (req.display !== 'granted') return;
    }

    const [h, m] = time.split(':').map(Number);
    if (Number.isNaN(h) || Number.isNaN(m)) return;

    await LocalNotifications.schedule({
      notifications: [
        {
          title: 'Fitness Coach',
          body: '💪 Hora de entrenar. ¡Tu rutina te espera!',
          id: REMINDER_ID,
          schedule: {
            on: { hour: h, minute: m },
            allowWhileIdle: true,
          },
        },
      ],
    });
  } catch (e) {
    console.warn('LocalNotifications no disponible (entorno web puro)', e);
  }
}

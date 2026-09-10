/**
 * Shared Web Push delivery gate for the service worker.
 * Quiet hours / browser-notification-off must suppress showNotification.
 * No VAPID secrets live here — prefs only.
 */
(function attachMsiWebPushGate(global) {
    function parseTimeToMinutes(value) {
        if (typeof value !== 'string') return null;
        var match = /^(\d{1,2}):(\d{2})$/.exec(value.trim());
        if (!match) return null;
        var hours = Number(match[1]);
        var minutes = Number(match[2]);
        if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;
        return hours * 60 + minutes;
    }

    function isWithinQuietHours(now, prefs) {
        if (!prefs || !prefs.quietHoursEnabled) return false;
        var start = parseTimeToMinutes(prefs.quietHoursStart);
        var end = parseTimeToMinutes(prefs.quietHoursEnd);
        if (start == null || end == null || start === end) return false;
        var current = now.getHours() * 60 + now.getMinutes();
        if (start < end) return current >= start && current < end;
        return current >= start || current < end;
    }

    function shouldDeliverWebPushNotification(now, prefs) {
        if (!prefs || prefs.browserNotificationsEnabled === false) return false;
        return !isWithinQuietHours(now, prefs);
    }

    function normalizeWebPushDeliveryPrefs(raw) {
        var o = raw && typeof raw === 'object' ? raw : {};
        return {
            browserNotificationsEnabled: o.browserNotificationsEnabled !== false,
            quietHoursEnabled: Boolean(o.quietHoursEnabled),
            quietHoursStart: typeof o.quietHoursStart === 'string' ? o.quietHoursStart : '22:00',
            quietHoursEnd: typeof o.quietHoursEnd === 'string' ? o.quietHoursEnd : '07:00',
        };
    }

    global.MSI_WEB_PUSH_GATE = {
        PREFS_CACHE: 'msi-web-push-prefs-v1',
        PREFS_URL: '/__msi_web_push_prefs',
        PREFS_MESSAGE_TYPE: 'MSI_WEB_PUSH_PREFS',
        parseTimeToMinutes: parseTimeToMinutes,
        isWithinQuietHours: isWithinQuietHours,
        shouldDeliverWebPushNotification: shouldDeliverWebPushNotification,
        normalizeWebPushDeliveryPrefs: normalizeWebPushDeliveryPrefs,
    };
})(typeof self !== 'undefined' ? self : globalThis);

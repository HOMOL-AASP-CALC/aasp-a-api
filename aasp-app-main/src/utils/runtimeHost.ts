export function getRuntimeHost() {
    return typeof window !== 'undefined' ? window.location.origin : '';
}
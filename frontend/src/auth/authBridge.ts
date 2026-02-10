let onAuthInvalid: (() => Promise<void>) | null = null;

export const registerAuthInvalidHandler = (fn: () => Promise<void>) => {
    onAuthInvalid = fn;
};

export const handleAuthInvalid = async () => {
    if (onAuthInvalid) {
        await onAuthInvalid();
    }
};

export const getNestedProperty = (obj: any, reference: string) => {
    return reference.split('.').reduce((o,k) => o && o[k], obj)
}
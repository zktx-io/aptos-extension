import { IAccount } from '../recoil';

export const getInterfaceType = (paramType: string): 'vector' | 'generic' => {
  return paramType.startsWith('vector') ? 'vector' : 'generic';
};

export const validateInput = (
  account: IAccount,
  paramType: string,
  value: string | string[],
): boolean => {
  if (typeof value === 'string' && typeof paramType === 'string') {
    switch (paramType) {
      case 'u8':
      case 'u16':
      case 'u32':
      case 'u64':
      case 'u128':
      case 'u256':
        return /^\d+$/.test(value);
      case 'bool':
        return /^(true|false)$/.test(value.toLowerCase());
      case 'address':
        return /^0x[a-fA-F0-9]{64}$/.test(value);
      case '0x1::string::String':
        return typeof value === 'string';
      default:
        break;
    }
  }

  if (paramType.startsWith('vector')) {
    let result = true;
    const tempType = paramType.replace('vector<', '').slice(0, -1);
    for (const item of value) {
      result &&= validateInput(account, tempType, item);
    }
    return result;
  }
  return false;
};

export const makeParams = (
  paramType: string,
  value: string | string[],
): any => {
  if (typeof paramType === 'string' && typeof value === 'string') {
    switch (paramType) {
      case 'u8':
      case 'u16':
      case 'u32':
        return parseInt(value);
      case 'u64':
      case 'u128':
      case 'u256':
        return BigInt(value);
      case 'bool':
        return value.toLowerCase() === 'true';
      case 'address':
      case '0x1::string::String':
        return value;
      default:
        break;
    }
  }
  if (paramType.startsWith('vector')) {
    const tempType = paramType.replace('vector<', '').slice(0, -1);
    const temp = [];
    for (const item of value) {
      switch (tempType) {
        case 'u8':
        case 'u16':
        case 'u32':
          temp.push(parseInt(item, 16));
          break;
        case 'u64':
        case 'u128':
        case 'u256':
          temp.push(BigInt(item));
          break;
        default:
          temp.push(makeParams(tempType, item));
          break;
      }
    }
    return temp;
  }
  return;
};

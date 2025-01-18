import { IAccount } from '../recoil';

export const getInterfaceType = (paramType: string): 'vector' | 'generic' => {
  return paramType.startsWith('vector') ? 'vector' : 'generic';
};

const validateVectors = (input: string, type: string): boolean => {
  try {
    const parsed = JSON.parse(input);

    if (!Array.isArray(parsed)) {
      return false;
    }

    const validateVector = (
      data: any,
      type: string,
      depth: number,
    ): boolean => {
      const vectorMatch = type.match(/^vector<(.+)>$/);
      if (vectorMatch) {
        const innerType = vectorMatch[1];
        if (!Array.isArray(data)) {
          return false;
        }
        return data.every((item) => validateVector(item, innerType, depth + 1));
      } else {
        if (type === 'u8') {
          return typeof data === 'number' && data >= 0 && data <= 255;
        }
        if (type === 'u16') {
          return typeof data === 'number' && data >= 0 && data <= 65535;
        }
        if (type === 'u32') {
          return typeof data === 'number' && data >= 0 && data <= 4294967295;
        }
        if (type === 'u64' || type === 'u128' || type === 'u256') {
          return typeof data === 'string' && /^[0-9]+$/.test(data);
        }
        if (type === 'address') {
          return /^0x[a-fA-F0-9]{64}$/.test(data);
        }
        if (type === 'bool') {
          return typeof data === 'boolean';
        }
        if (type === '0x1::string::String') {
          return typeof data === 'string';
        }
        return false;
      }
    };
    return validateVector(parsed, type, 0);
  } catch {
    return false;
  }
};

export const validateInput = (
  _account: IAccount,
  paramType: string,
  value: string,
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

  const vectorMatch = paramType.match(/^vector<(.+)>$/);
  if (vectorMatch) {
    return validateVectors(value, `vector<${vectorMatch[1]}>`);
  }

  return false;
};

const processAndConvertVectors = (data: any, paramType: string): any => {
  const vectorMatch = paramType.match(/^vector<(.+)>$/);
  if (vectorMatch) {
    const innerType = vectorMatch[1];
    if (!Array.isArray(data)) {
      throw new Error(`Invalid data: expected array for ${paramType}`);
    }
    return data.map((item) => processAndConvertVectors(item, innerType));
  } else {
    switch (paramType) {
      case 'u8':
      case 'u16':
      case 'u32':
        return parseInt(data).toString();
      case 'u64':
      case 'u128':
      case 'u256':
        return BigInt(data);
      case 'bool':
        return data.toLowerCase() === 'true';
      case 'address':
      case '0x1::string::String':
        return data;
      default:
        throw new Error(`Unsupported type: ${paramType}`);
    }
  }
};

export const makeParams = (paramType: string, value: string): any => {
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

  const vectorMatch = paramType.match(/^vector<(.+)>$/);
  if (vectorMatch) {
    return processAndConvertVectors(
      JSON.parse(value),
      `vector<${vectorMatch[1]}>`,
    );
  }
  return;
};

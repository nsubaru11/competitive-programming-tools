/** settings.schema.json が使う範囲の JSON Schema。 */
export type SchemaNode = {
	readonly type?: string;
	readonly enum?: readonly unknown[];
	readonly minimum?: number;
	readonly maximum?: number;
	readonly minLength?: number;
	readonly pattern?: string;
	readonly items?: SchemaNode;
	readonly properties?: Readonly<Record<string, SchemaNode>>;
	readonly additionalProperties?: boolean | SchemaNode;
	readonly propertyNames?: {readonly pattern: string};
};

export function isPlainObject(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}

function typeMatches(value: unknown, type: string): boolean {
	switch (type) {
		case "object":
			return isPlainObject(value);
		case "array":
			return Array.isArray(value);
		case "integer":
			return Number.isInteger(value);
		default:
			return typeof value === type;
	}
}

function describeType(type: string): string {
	return /^[aeio]/.test(type) ? `an ${type}` : `a ${type}`;
}

/** 値をスキーマと照合し、合わない点を「項目の名前: 理由」の形で返す。合っていれば空にする。 */
export function validateAgainstSchema(value: unknown, schema: SchemaNode, name = ""): string[] {
	const label = name || "(settings)";
	if (schema.type !== undefined && !typeMatches(value, schema.type)) {
		return [`${label}: must be ${describeType(schema.type)}`];
	}
	if (schema.enum !== undefined && !schema.enum.includes(value)) {
		return [`${label}: must be one of ${schema.enum.map((item) => JSON.stringify(item)).join(", ")}`];
	}
	const errors: string[] = [];
	if (typeof value === "number") {
		if (schema.minimum !== undefined && value < schema.minimum) errors.push(`${label}: must be ${schema.minimum} or more`);
		if (schema.maximum !== undefined && value > schema.maximum) errors.push(`${label}: must be ${schema.maximum} or less`);
	}
	if (typeof value === "string") {
		if (schema.minLength !== undefined && value.length < schema.minLength) errors.push(`${label}: must not be empty`);
		if (schema.pattern !== undefined && !new RegExp(schema.pattern).test(value)) {
			errors.push(`${label}: must match ${schema.pattern}`);
		}
	}
	if (Array.isArray(value) && schema.items !== undefined) {
		value.forEach((item, index) => errors.push(...validateAgainstSchema(item, schema.items!, `${name}[${index}]`)));
	}
	if (isPlainObject(value)) {
		const keyPattern = schema.propertyNames === undefined ? null : new RegExp(schema.propertyNames.pattern);
		for (const [key, item] of Object.entries(value)) {
			const childName = name ? `${name}.${key}` : key;
			const child = schema.properties?.[key];
			if (child !== undefined) {
				errors.push(...validateAgainstSchema(item, child, childName));
			} else if (keyPattern !== null && !keyPattern.test(key)) {
				errors.push(`${childName}: the name must match ${schema.propertyNames!.pattern}`);
			} else if (isPlainObject(schema.additionalProperties)) {
				errors.push(...validateAgainstSchema(item, schema.additionalProperties, childName));
			} else if (schema.additionalProperties === false) {
				errors.push(`${childName}: unknown setting`);
			}
		}
	}
	return errors;
}

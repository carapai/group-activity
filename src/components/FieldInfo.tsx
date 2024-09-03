import { FieldApi } from "@tanstack/react-form";

export default function FieldInfo({
    field,
}: {
    field: FieldApi<any, any, any, any>;
}) {
    return <>{field.state.meta.isValidating ? "Validating..." : null}</>;
}

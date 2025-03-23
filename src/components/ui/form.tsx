import * as React from "react"
import { Form as KendoForm, Field, FormElement } from "@progress/kendo-react-form"
import { Error } from "@progress/kendo-react-labels"
import { Input } from "@progress/kendo-react-inputs"
import { cn } from "@/lib/utils"

interface FormProps extends React.ComponentProps<typeof KendoForm> {
  className?: string
}

const Form = React.forwardRef<HTMLFormElement, FormProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <KendoForm
        ref={ref}
        className={cn("k-form", className)}
        {...props}
      >
        <FormElement>{children}</FormElement>
      </KendoForm>
    )
  }
)

Form.displayName = "Form"

interface FormFieldProps {
  name: string
  label?: string
  component?: React.ComponentType<any>
  validator?: (value: any) => string | undefined
  className?: string
}

const FormField = React.forwardRef<HTMLDivElement, FormFieldProps>(
  ({ name, label, component = Input, validator, className, ...props }, ref) => {
    return (
      <div ref={ref} className={cn("k-form-field", className)}>
        <Field
          name={name}
          label={label}
          component={component}
          validator={validator}
          {...props}
        />
      </div>
    )
  }
)

FormField.displayName = "FormField"

const FormError = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof Error>
>(({ className, ...props }, ref) => {
  return (
    <Error
      ref={ref}
      className={cn("k-form-error", className)}
      {...props}
    />
  )
})

FormError.displayName = "FormError"

export { Form, FormField, FormError }

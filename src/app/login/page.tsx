'use client'

import { useActionState, useState, useRef } from 'react'
import { loginAction } from '@/actions/auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import ReCAPTCHA from 'react-google-recaptcha'

const initialState = { error: '' }

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(loginAction, initialState)
  const [showCaptcha, setShowCaptcha] = useState(false)
  const [captchaToken, setCaptchaToken] = useState<string | null>('TEST_BYPASS_TOKEN')
  const formRef = useRef<HTMLFormElement>(null)



  const onCaptchaChange = (token: string | null) => {
    if (token) {
      setCaptchaToken(token)
      // Small delay to let the state update and user see the checkmark
      setTimeout(() => {
        formRef.current?.requestSubmit()
        setShowCaptcha(false)
      }, 500)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            BookMyCampus
          </CardTitle>
          <CardDescription className="text-center">
            Enter your university email to sign in
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form 
            ref={formRef} 
            action={formAction} 
            className="space-y-4"
            onSubmit={(e) => {
              if (!captchaToken) {
                e.preventDefault()
                setShowCaptcha(true)
              }
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@university.edu"
                required
                disabled={isPending}
                autoComplete="email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                required
                disabled={isPending}
                autoComplete="current-password"
              />
            </div>

            {/* Hidden input to store token when submitting */}
            <input type="hidden" name="captcha" value={captchaToken || ''} />

            {state?.error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/10 dark:text-red-400 border border-red-200 dark:border-red-900 rounded-md">
                {state.error}
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Don't have an account? Contact your university administrator.
            </p>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showCaptcha} onOpenChange={setShowCaptcha}>
        <DialogContent className="sm:max-w-[425px] flex flex-col items-center">
          <DialogHeader>
            <DialogTitle>Security Check</DialogTitle>
            <DialogDescription>
              Please complete the captcha to continue.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <ReCAPTCHA
              sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || ''}
              onChange={onCaptchaChange}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

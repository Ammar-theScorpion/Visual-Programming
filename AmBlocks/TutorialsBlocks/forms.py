from django import forms
from .models import Temp
class UserCode(forms.ModelForm):
    class Meta:
        model = Temp
        fields = ['user_code']
        widgets = {
            'user_code': forms.HiddenInput()
        }
    
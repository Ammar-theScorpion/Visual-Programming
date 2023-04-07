from django import forms
from .models import Problem
class UserCodeForm(forms.ModelForm):
    class Meta:
        model = Problem
        fields = ['user_code']
        widgets = {
            'user_code': forms.HiddenInput(),
        }
from django.db import models
import sys

class Problem(models.Model):
    pname = models.CharField(max_length=25, primary_key=True)
    body = models.TextField()
    valid_code = models.TextField()
    sequence = models.IntegerField(default=0)


    def __str__(self):
        return (
        f"{self.pname} "
        f"{self.body[:30]}..."
        )
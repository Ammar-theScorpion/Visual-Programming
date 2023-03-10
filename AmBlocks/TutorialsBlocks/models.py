from django.db import models

# Create your models here.
class Tutorial(models.Model):
    tname = models.CharField(max_length=25, primary_key=True)
    body = models.TextField()
    block_id = models.CharField(max_length=50, unique=True)
    def __str__(self):
        return (
        f"{self.tname} "
        f"{self.body[:30]}..."
        f"{self.block_id}"
        )
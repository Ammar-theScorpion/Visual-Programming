# Generated by Django 4.1.7 on 2023-03-17 16:34

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('TutorialsBlocks', '0003_tutorial_valid_code'),
    ]

    operations = [
        migrations.CreateModel(
            name='Temp',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('user_code', models.TextField()),
            ],
        ),
    ]

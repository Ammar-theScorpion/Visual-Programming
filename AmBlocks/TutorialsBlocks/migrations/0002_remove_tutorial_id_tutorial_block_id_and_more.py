# Generated by Django 4.1.7 on 2023-03-10 07:11

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('TutorialsBlocks', '0001_initial'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='tutorial',
            name='id',
        ),
        migrations.AddField(
            model_name='tutorial',
            name='block_id',
            field=models.CharField(default=1, max_length=50, unique=True),
            preserve_default=False,
        ),
        migrations.AlterField(
            model_name='tutorial',
            name='tname',
            field=models.CharField(max_length=25, primary_key=True, serialize=False),
        ),
    ]